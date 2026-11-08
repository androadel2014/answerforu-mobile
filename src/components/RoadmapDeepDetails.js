import React from 'react';
import {View} from 'react-native';
import {Card,Txt} from './UI';
import ServerContent from './ServerContent';
import {usePublishedContent} from '../services/publishedContent';
import {tr} from '../i18n';
import {C} from '../theme';
const datasets=[
  ['roadmap-guide-locales','دليل الخطوة','Full guidance','Guía completa'],
  ['roadmap-guides','شرح إضافي','Detailed guidance','Guía detallada'],
  ['roadmap-actions','الإجراءات المطلوبة','Actions','Acciones'],
  ['roadmap-warnings-locales','تحذيرات','Warnings','Advertencias'],
  ['roadmap-warnings-ar','تحذيرات إضافية','Additional warnings','Advertencias adicionales'],
  ['roadmap-costs','التكاليف','Costs','Costos'],
  ['roadmap-effort','الوقت والمجهود','Time and effort','Tiempo y esfuerzo'],
];
function SourceSection({stepId,stageId,lang,keyName,ar,en,es}){
 const {data,loading,error}=usePublishedContent(keyName);
 const record=keyName==='roadmap-warnings-ar'?(data?.steps?.[stepId]??data?.stages?.[stageId]):data?.[stepId];
 if(!record)return null;
 return <Card style={{gap:10}}><Txt lang={lang} weight="900" style={{fontSize:18,color:C.ink}}>{tr(lang,ar,en,es)}</Txt><ServerContent lang={lang} value={record}/></Card>;
}
export default function RoadmapDeepDetails({stepId,stageId,lang}){
 if(!stepId)return null;
 return <View style={{gap:12}}>{datasets.map(([keyName,ar,en,es])=><SourceSection key={keyName+stepId} keyName={keyName} stepId={stepId} stageId={stageId} lang={lang} ar={ar} en={en} es={es}/>)}</View>;
}
