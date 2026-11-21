/**
 * AnswerForU v6.4.2 (tester item 8 — "Word at minimum, Excel preferred"):
 * dependency-free .xlsx writer. It produces a real Office Open XML workbook
 * (shared strings, styles, frozen header row, filters, right-to-left sheets
 * for Arabic, print titles) that opens in Excel, LibreOffice, Numbers and
 * Google Sheets. No formulas are ever written: every text cell is a shared
 * string, so content that starts with "=" cannot execute.
 */
import { createZip } from "./zip.mjs";

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MAX_CELL_TEXT = 32767;

// cellXfs indexes in styles.xml below.
export const XLSX_STYLES = Object.freeze({
  default: 0,
  title: 1,
  header: 2,
  text: 3,
  bold: 4,
  percent: 5,
  int: 6,
  done: 7,
  doing: 8,
  muted: 9,
  center: 10,
});

function wellFormed(value) {
  const text = String(value ?? "");
  if (typeof text.toWellFormed === "function") return text.toWellFormed();
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) { out += text[i] + text[i + 1]; i += 1; } else out += "�";
    } else if (code >= 0xdc00 && code <= 0xdfff) out += "�";
    else out += text[i];
  }
  return out;
}

// XML 1.0 forbids most C0 controls and U+FFFE/U+FFFF.
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

export function xmlEscape(value) {
  return wellFormed(value)
    .replace(INVALID_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function columnName(index) {
  let n = Math.max(0, Math.floor(index)) + 1;
  let name = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

export function sanitizeSheetName(value, used = new Set()) {
  let base = wellFormed(value).replace(/[[\]:*?/\\]/g, " ").replace(/\s+/g, " ").trim().replace(/^'+|'+$/g, "");
  if (!base) base = "Sheet";
  const fit = (text, max) => {
    let out = "";
    for (const ch of Array.from(text)) {
      if ((out + ch).length > max) break;
      out += ch;
    }
    return out.trim() || "Sheet";
  };
  let name = fit(base, 31);
  let counter = 2;
  while (used.has(name.toLowerCase())) {
    const suffix = ` (${counter})`;
    name = fit(base, 31 - suffix.length) + suffix;
    counter += 1;
  }
  used.add(name.toLowerCase());
  return name;
}

const quoteSheet = (name) => `'${name.replace(/'/g, "''")}'`;

function normalizeCell(cell, fallbackStyle) {
  if (cell && typeof cell === "object" && !(cell instanceof Date)) {
    const style = XLSX_STYLES[cell.s] ?? XLSX_STYLES[fallbackStyle] ?? 0;
    return { value: cell.v, style };
  }
  return { value: cell, style: XLSX_STYLES[fallbackStyle] ?? 0 };
}

function stylesXml() {
  const border = '<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>';
  const solid = (rgb) => `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
  const xfs = [
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>',
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>',
    '<xf numFmtId="9" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>',
    '<xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>',
  ];
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<fonts count="5">'
    + '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>'
    + '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>'
    + '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>'
    + '<font><b/><sz val="15"/><color rgb="FF0F172A"/><name val="Calibri"/><family val="2"/></font>'
    + '<font><sz val="10"/><color rgb="FF475569"/><name val="Calibri"/><family val="2"/></font>'
    + '</fonts>'
    + `<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${solid("FF0F172A")}${solid("FFDCFCE7")}${solid("FFDBEAFE")}${solid("FFF1F5F9")}</fills>`
    + `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${border}</borders>`
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + `<cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs>`
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
    + '</styleSheet>';
}

function worksheetXml(sheet, index, strings) {
  const rows = Array.isArray(sheet.rows) ? sheet.rows : [];
  const fallback = sheet.defaultStyle || "text";
  let maxCols = 0;
  const rowXml = rows.map((row, rowIndex) => {
    const cells = Array.isArray(row) ? row : [];
    maxCols = Math.max(maxCols, cells.length);
    const r = rowIndex + 1;
    const cellXml = cells.map((raw, colIndex) => {
      const { value, style } = normalizeCell(raw, fallback);
      const ref = `${columnName(colIndex)}${r}`;
      const s = style ? ` s="${style}"` : "";
      if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"${s}><v>${value}</v></c>`;
      if (typeof value === "boolean") return `<c r="${ref}"${s} t="b"><v>${value ? 1 : 0}</v></c>`;
      if (value === null || value === undefined || value === "") return style ? `<c r="${ref}"${s}/>` : "";
      let text = wellFormed(value);
      if (text.length > MAX_CELL_TEXT) text = `${text.slice(0, MAX_CELL_TEXT - 1)}…`;
      return `<c r="${ref}"${s} t="s"><v>${strings.add(text)}</v></c>`;
    }).join("");
    return `<row r="${r}">${cellXml}</row>`;
  }).join("");

  const lastCol = columnName(Math.max(0, maxCols - 1));
  const lastRow = Math.max(1, rows.length);
  const freeze = Math.max(0, Math.floor(sheet.freezeRows || 0));
  const pane = freeze
    ? `<pane ySplit="${freeze}" topLeftCell="A${freeze + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A${freeze + 1}" sqref="A${freeze + 1}"/>`
    : "";
  const cols = Array.isArray(sheet.columns) && sheet.columns.length
    ? `<cols>${sheet.columns.map((col, i) => `<col min="${i + 1}" max="${i + 1}" width="${Number(col?.width) > 0 ? Number(col.width) : 14}" customWidth="1"/>`).join("")}</cols>`
    : "";
  const filterRow = Math.floor(sheet.autoFilterRow || 0);
  const autoFilter = filterRow > 0 && rows.length >= filterRow ? `<autoFilter ref="A${filterRow}:${lastCol}${lastRow}"/>` : "";
  const merges = Array.isArray(sheet.merges) && sheet.merges.length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((ref) => `<mergeCell ref="${xmlEscape(ref)}"/>`).join("")}</mergeCells>`
    : "";
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    + '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
    + `<dimension ref="A1:${lastCol}${lastRow}"/>`
    + `<sheetViews><sheetView workbookViewId="0"${sheet.rtl ? ' rightToLeft="1"' : ""}${index === 0 ? ' tabSelected="1"' : ""}>${pane}</sheetView></sheetViews>`
    + '<sheetFormatPr defaultRowHeight="15"/>'
    + cols
    + `<sheetData>${rowXml}</sheetData>`
    + autoFilter
    + merges
    + '<pageMargins left="0.4" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'
    + '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>'
    + '<headerFooter><oddFooter>&amp;C&amp;P / &amp;N</oddFooter></headerFooter>'
    + "</worksheet>";
}

/**
 * @param {{
 *   title?: string, creator?: string, date?: Date,
 *   sheets: {name:string, rows:any[][], columns?:{width:number}[], rtl?:boolean,
 *            freezeRows?:number, autoFilterRow?:number, merges?:string[], defaultStyle?:string}[]
 * }} options
 * @returns {Uint8Array}
 */
export function buildXlsx({ sheets, title = "", creator = "AnswerForU", date = new Date() } = {}) {
  const list = (Array.isArray(sheets) && sheets.length ? sheets : [{ name: "Sheet", rows: [] }]);
  const used = new Set();
  const named = list.map((sheet) => ({ ...sheet, name: sanitizeSheetName(sheet.name, used) }));

  const table = new Map();
  const ordered = [];
  let references = 0;
  const strings = {
    add(text) {
      references += 1;
      if (!table.has(text)) { table.set(text, ordered.length); ordered.push(text); }
      return table.get(text);
    },
  };
  const sheetXml = named.map((sheet, index) => worksheetXml(sheet, index, strings));

  const definedNames = named.flatMap((sheet, index) => {
    const out = [];
    const rows = Array.isArray(sheet.rows) ? sheet.rows : [];
    const filterRow = Math.floor(sheet.autoFilterRow || 0);
    if (filterRow > 0 && rows.length >= filterRow) {
      const maxCols = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
      const lastCol = columnName(Math.max(0, maxCols - 1));
      out.push(`<definedName name="_xlnm._FilterDatabase" localSheetId="${index}" hidden="1">${xmlEscape(quoteSheet(sheet.name))}!$A$${filterRow}:$${lastCol}$${rows.length}</definedName>`);
      out.push(`<definedName name="_xlnm.Print_Titles" localSheetId="${index}">${xmlEscape(quoteSheet(sheet.name))}!$${filterRow}:$${filterRow}</definedName>`);
    }
    return out;
  });

  const stamp = (date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const sheetsCount = named.length;
  const files = [
    {
      name: "[Content_Types].xml",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        + '<Default Extension="xml" ContentType="application/xml"/>'
        + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        + named.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")
        + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        + '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
        + '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
        + "</Types>",
    },
    {
      name: "_rels/.rels",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
        + '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
        + "</Relationships>",
    },
    {
      name: "docProps/core.xml",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + `<dc:title>${xmlEscape(title)}</dc:title><dc:creator>${xmlEscape(creator)}</dc:creator>`
        + `<dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified>`
        + "</cp:coreProperties>",
    },
    {
      name: "docProps/app.xml",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>AnswerForU</Application></Properties>',
    },
    {
      name: "xl/workbook.xml",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        + '<workbookPr/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="16000" windowHeight="9000" activeTab="0"/></bookViews>'
        + `<sheets>${named.map((sheet, i) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>`
        + (definedNames.length ? `<definedNames>${definedNames.join("")}</definedNames>` : "")
        + "</workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + named.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
        + `<Relationship Id="rId${sheetsCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
        + `<Relationship Id="rId${sheetsCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`
        + "</Relationships>",
    },
    { name: "xl/styles.xml", data: stylesXml() },
    ...sheetXml.map((xml, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: xml })),
    {
      name: "xl/sharedStrings.xml",
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        + `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${references}" uniqueCount="${ordered.length}">`
        + ordered.map((text) => `<si><t xml:space="preserve">${xmlEscape(text)}</t></si>`).join("")
        + "</sst>",
    },
  ];
  return createZip(files, { date });
}
