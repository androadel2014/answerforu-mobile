import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {Card,Icon,NumBadge,Txt} from './UI';
import {usePublishedContent} from '../services/publishedContent';
import {tr} from '../i18n';
import {C} from '../theme';
import {STEP_GUIDE_KEYS,stepGuideModel} from '../logic/stepGuide.mjs';
/**
 * AnswerForU mobile 3.7.1 — tester items 5 + 6.
 * The open step no longer stacks seven datasets («دليل الخطوة», «شرح إضافي», «الإجراءات المطلوبة»,
 * «تحذيرات», «تحذيرات إضافية», costs, effort) that repeated each other. Each fact appears once:
 *   StepGuideCard    «دليل الخطوة»  — short broad points
 *   (screen)         «الإجراءات المطلوبة» — the interactive checklist
 *   StepWarningsCard «التحذيرات»    — merged, de-duplicated, max 3
 *   StepDetailsCard  «الشرح الإضافي» — every detail, collapsed until opened
 * Numbers are round badges (no ".1" in Arabic) and rows follow the app's RTL direction.
 */
export function useStepGuide({stepId,stageId,lang,checklistLabels=[]}){
 const guides=usePublishedContent(STEP_GUIDE_KEYS.guides).data;
 const guideLocales=usePublishedContent(STEP_GUIDE_KEYS.guideLocales).data;
 const actions=usePublishedContent(STEP_GUIDE_KEYS.actions).data;
 const warningsLocales=usePublishedContent(STEP_GUIDE_KEYS.warningsLocales).data;
 const warningsAr=usePublishedContent(STEP_GUIDE_KEYS.warningsAr).data;
 const costs=usePublishedContent(STEP_GUIDE_KEYS.costs).data;
 const effort=usePublishedContent(STEP_GUIDE_KEYS.effort).data;
 const labelsKey=checklistLabels.join('\u0001');
 return useMemo(()=>stepGuideModel({stepId,stageId,lang,checklistLabels,data:{guides,guideLocales,actions,warningsLocales,warningsAr,costs,effort}}),[stepId,stageId,lang,labelsKey,guides,guideLocales,actions,warningsLocales,warningsAr,costs,effort]);
}
function Heading({lang,icon,title,tone}){
 return <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name={icon} size={18} color={tone==='red'?C.redInk:C.blue}/><Txt lang={lang} weight="900" style={{fontSize:18,color:C.ink,flex:1}}>{title}</Txt></View>;
}
export function StepGuideCard({model,lang}){
 if(!model?.points?.length)return null;
 return <Card style={{gap:10}}>
  <Heading lang={lang} icon="compass" title={tr(lang,'دليل الخطوة','Step guide','Guía del paso')}/>
  <Txt lang={lang} floor={13} style={{color:C.muted,fontSize:14}}>{tr(lang,'النقاط الأساسية باختصار — التفاصيل كلها في «الشرح الإضافي».','The key points in brief — every detail is in “More details”.','Lo esencial en breve; los detalles están en «Más detalles».')}</Txt>
  {model.points.map((point,i)=><View key={`p${i}`} style={{flexDirection:'row',alignItems:'flex-start',gap:9}}><NumBadge n={i+1}/><View style={{flex:1}}><Txt lang={lang} style={{lineHeight:24}}>{point}</Txt></View></View>)}
 </Card>;
}
export function StepWarningsCard({model,lang}){
 if(!model?.warnings?.length)return null;
 return <Card style={{gap:10,backgroundColor:C.redSoft,borderColor:C.redLine}}>
  <Heading lang={lang} icon="alert-triangle" tone="red" title={tr(lang,'التحذيرات','Warnings','Advertencias')}/>
  {model.warnings.map((warning,i)=><View key={`w${i}`} style={{flexDirection:'row',alignItems:'flex-start',gap:9}}><NumBadge n={i+1} tone="red"/><View style={{flex:1}}><Txt lang={lang} style={{lineHeight:24,color:C.ink}}>{warning}</Txt></View></View>)}
 </Card>;
}
export function StepDetailsCard({model,lang}){
 const [open,setOpen]=useState(false);
 if(!model?.hasDetails)return null;
 const d=model.details;
 return <Card style={{gap:10}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(v=>!v)} style={{flexDirection:'row',alignItems:'center',gap:8,minHeight:44}}>
   <Icon name="book-open" size={18} color={C.blue}/>
   <Txt lang={lang} weight="900" style={{fontSize:18,flex:1}}>{tr(lang,'الشرح الإضافي — كل التفاصيل','More details — the full explanation','Más detalles: la explicación completa')}</Txt>
   <Icon name={open?'chevron-up':'chevron-down'} size={20} color={C.ink}/>
  </Pressable>
  {open?<View style={{gap:10}}>
   {d.title?<Txt lang={lang} weight="900" style={{fontSize:16}}>{d.title}</Txt>:null}
   {d.paragraphs.map((p,i)=><Txt key={`d${i}`} lang={lang} selectable style={{lineHeight:26}}>{p}</Txt>)}
   {d.cost?<View style={{gap:4}}><Txt lang={lang} weight="900" style={{color:C.blue}}>{tr(lang,'التكلفة','Cost','Costo')}</Txt><Txt lang={lang} style={{lineHeight:24}}>{d.cost}</Txt></View>:null}
   {d.effort?<Txt lang={lang} style={{color:C.muted}}>{d.effort}</Txt>:null}
   {d.video?<View style={{gap:4}}><Txt lang={lang} weight="900" style={{color:C.blue}}>{tr(lang,'فيديو مقترح','Suggested video','Video sugerido')}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:24}}>{d.video}</Txt></View>:null}
  </View>:null}
 </Card>;
}
/** Back-compatible: all three cards for a step (screens may place the checklist between them). */
export default function RoadmapDeepDetails({stepId,stageId,lang,checklistLabels=[]}){
 const model=useStepGuide({stepId,stageId,lang,checklistLabels});
 if(!stepId)return null;
 return <View style={{gap:12}}><StepGuideCard model={model} lang={lang}/><StepWarningsCard model={model} lang={lang}/><StepDetailsCard model={model} lang={lang}/></View>;
}
