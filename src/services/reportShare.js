import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {buildXlsx,XLSX_MIME} from '../logic/export/xlsx.mjs';
import {buildDocx,DOCX_MIME} from '../logic/export/docx.mjs';
// AnswerForU mobile 3.7.1 (tester item 8): write the report to the app cache and open the
// system share sheet (save to Files / Drive, e-mail, WhatsApp…). Excel and Word only.
const UTI={xlsx:'org.openxmlformats.spreadsheetml.sheet',docx:'org.openxmlformats.wordprocessingml.document'};
export function reportFileName(base,ext,date=new Date()){const d=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;return `${String(base).replace(/[^\w.-]+/g,'-')}-${d}.${ext}`;}
export async function shareReport(format,{workbook,document,baseName,dialogTitle}){
  const xlsx=format==='xlsx';
  const bytes=xlsx?buildXlsx(workbook):buildDocx(document);
  const file=new File(Paths.cache,reportFileName(baseName,xlsx?'xlsx':'docx'));
  try{if(file.exists)file.delete();}catch{}
  file.write(bytes);
  if(!(await Sharing.isAvailableAsync()))throw new Error('Sharing is not available on this device');
  await Sharing.shareAsync(file.uri,{mimeType:xlsx?XLSX_MIME:DOCX_MIME,dialogTitle,UTI:UTI[xlsx?'xlsx':'docx']});
}
