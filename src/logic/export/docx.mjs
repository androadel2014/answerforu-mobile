/**
 * AnswerForU mobile 3.7.1 (tester item 8 — "Word at minimum"): a small, dependency-free .docx
 * writer for the journey report and the Survival English sheet. The website builds the same
 * reports with the `docx` package; the app cannot add a native-size dependency, so this writes
 * plain WordprocessingML: title, meta lines, headings, paragraphs and tables, right-to-left for
 * Arabic (bidi paragraphs, RTL runs, visually RTL tables) with Latin runs kept left-to-right.
 */
import { createZip } from './zip.mjs';
import { bidiSegments, hasRtl } from '../bidi.mjs';

export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const STRONG_LTR = /[A-Za-zÀ-ɏ]/;
const STRONG_RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿‎‏⁦-⁩]/g;
const esc = (v) => String(v ?? '').replace(INVALID_XML, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function paragraphIsRtl(text, documentRtl) {
  const value = String(text ?? '');
  const rtl = hasRtl(value);
  if (!rtl && !STRONG_LTR.test(value)) return Boolean(documentRtl);
  if (!rtl) return false;
  if (documentRtl) return true;
  for (const ch of value) { if (STRONG_RTL.test(ch)) return true; if (STRONG_LTR.test(ch)) return false; }
  return false;
}
export function runPlan(text, rtlParagraph) {
  return bidiSegments(String(text ?? '')).filter((s) => s.text !== '').map((s) => ({ text: s.text, rtl: rtlParagraph ? !s.ltr : !s.ltr && hasRtl(s.text) }));
}

const PAGE = { width: 12240, height: 15840 };
const MARGIN = 1008;

function runXml(segment, style) {
  const props = [
    style.bold ? '<w:b/><w:bCs/>' : '',
    style.color ? `<w:color w:val="${style.color}"/>` : '',
    style.size ? `<w:sz w:val="${style.size}"/><w:szCs w:val="${style.size}"/>` : '',
    segment.rtl ? '<w:rtl/>' : '',
    segment.rtl ? '<w:lang w:bidi="ar-EG"/>' : '',
  ].join('');
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(segment.text)}</w:t></w:r>`;
}
function paragraphXml(text, documentRtl, style = {}) {
  const rtl = paragraphIsRtl(text, documentRtl);
  const ppr = [
    style.styleId ? `<w:pStyle w:val="${style.styleId}"/>` : '',
    style.keepNext ? '<w:keepNext/>' : '',
    rtl ? '<w:bidi/>' : '',
    `<w:spacing w:before="${style.before || 0}" w:after="${style.after ?? 80}"/>`,
    style.center ? '<w:jc w:val="center"/>' : '',
  ].join('');
  return `<w:p><w:pPr>${ppr}</w:pPr>${runPlan(text, rtl).map((seg) => runXml(seg, style)).join('')}</w:p>`;
}
const FILLS = { header: '0F172A', done: 'DCFCE7', doing: 'DBEAFE', muted: 'F1F5F9' };
function tableXml(block, documentRtl, usable) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];
  const columns = Math.max(headers.length, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 1);
  const weights = Array.from({ length: columns }, (_, i) => (Number(block.widths?.[i]) > 0 ? Number(block.widths[i]) : 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((usable * w) / sum));
  const border = 'w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"';
  const cell = (raw, i, header) => {
    const value = raw && typeof raw === 'object' ? raw : { text: raw };
    const lines = Array.isArray(value.lines) ? value.lines : [String(value.text ?? '')];
    const fill = FILLS[header ? 'header' : value.tone];
    const style = { bold: header || value.bold, color: header ? 'FFFFFF' : undefined, size: 19, after: 40 };
    return `<w:tc><w:tcPr><w:tcW w:w="${widths[i]}" w:type="dxa"/>${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ''}</w:tcPr>${(lines.length ? lines : ['']).map((line) => paragraphXml(line, documentRtl, style)).join('')}</w:tc>`;
  };
  const head = headers.length ? `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${headers.map((h, i) => cell(h, i, true)).join('')}</w:tr>` : '';
  const body = rows.map((row) => `<w:tr>${Array.from({ length: columns }, (_, i) => cell(Array.isArray(row) ? row[i] ?? '' : '', i, false)).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr>${documentRtl ? '<w:bidiVisual/>' : ''}<w:tblW w:w="${usable}" w:type="dxa"/><w:tblBorders><w:top ${border}/><w:left ${border}/><w:bottom ${border}/><w:right ${border}/><w:insideH ${border}/><w:insideV ${border}/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${head}${body}</w:tbl>`;
}

/** spec: { title, lang, landscape?, blocks: [{type:'title'|'meta'|'heading'|'paragraph'|'table', ...}] } (same blocks as the website reports) */
export function buildDocx(spec = {}, { date = new Date() } = {}) {
  const documentRtl = spec.lang === 'ar';
  const landscape = Boolean(spec.landscape);
  const pageW = landscape ? PAGE.height : PAGE.width;
  const pageH = landscape ? PAGE.width : PAGE.height;
  const usable = pageW - MARGIN * 2;
  const body = (spec.blocks || []).filter(Boolean).map((block) => {
    if (block.type === 'title') return paragraphXml(block.text, documentRtl, { styleId: 'Title', bold: true, size: 36, color: '0F172A', center: true, after: 120 });
    if (block.type === 'meta') return paragraphXml(block.text, documentRtl, { color: '475569', size: 19, center: true, after: 60 });
    if (block.type === 'heading') return paragraphXml(block.text, documentRtl, { styleId: block.level === 2 ? 'Heading2' : 'Heading1', keepNext: true, bold: true, size: block.level === 2 ? 24 : 28, color: block.level === 2 ? '1E3A8A' : '0F172A', before: block.level === 2 ? 200 : 320, after: 100 });
    if (block.type === 'paragraph') return paragraphXml(block.text, documentRtl, { bold: block.bold, after: 100 });
    if (block.type === 'table') return tableXml(block, documentRtl, usable) + '<w:p/>';
    return '';
  }).join('');
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>${body}<w:sectPr><w:pgSz w:w="${pageW}" w:h="${pageH}"${landscape ? ' w:orient="landscape"' : ''}/><w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const font = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Arial"/>';
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr>${font}<w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-US" w:bidi="ar-EG"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr></w:style>'
    + '</w:styles>';
  const stamp = (date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date()).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return createZip([
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' },
    { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(spec.title || 'AnswerForU')}</dc:title><dc:creator>AnswerForU</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified></cp:coreProperties>` },
    { name: 'docProps/app.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>AnswerForU</Application></Properties>' },
    { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
    { name: 'word/styles.xml', data: styles },
    { name: 'word/document.xml', data: document },
  ], { date });
}
