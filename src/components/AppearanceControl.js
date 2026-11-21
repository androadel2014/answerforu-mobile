import React from 'react';
import {Pressable,View} from 'react-native';
import {Card,Icon,Txt} from './UI';
import {C} from '../theme';
import {tr} from '../i18n';
// AnswerForU mobile 3.7.1 (tester item 7): manual light / dark, or automatic (follows the phone).
const OPTIONS=[['light','sun','فاتح','Light','Claro'],['dark','moon','داكن','Dark','Oscuro'],['auto','smartphone','تلقائي','Automatic','Automático']];
export default function AppearanceControl({lang='ar',value='auto',resolved='light',onChange}){
  return <Card style={{gap:10}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name={resolved==='dark'?'moon':'sun'} size={18} color={C.blue}/><Txt lang={lang} weight="900" style={{fontSize:17,flex:1}}>{tr(lang,'المظهر','Appearance','Apariencia')}</Txt></View>
    <Txt lang={lang} style={{color:C.muted,fontSize:14}}>{tr(lang,'«تلقائي» يتبع إعداد الوضع الليلي في هاتفك.','“Automatic” follows your phone’s dark-mode setting.','“Automático” sigue el modo oscuro de tu teléfono.')}</Txt>
    <View accessibilityRole="radiogroup" accessibilityLabel={tr(lang,'المظهر','Appearance','Apariencia')} style={{flexDirection:'row',gap:7}}>
      {OPTIONS.map(([id,icon,ar,en,es])=>{const on=value===id;return <Pressable key={id} accessibilityRole="radio" accessibilityState={{checked:on}} accessibilityLabel={tr(lang,ar,en,es)} onPress={()=>onChange?.(id)} style={{flex:1,minHeight:64,borderRadius:14,borderWidth:on?2:1.3,borderColor:on?C.royal:C.line,backgroundColor:on?C.royalSoft:C.paper,alignItems:'center',justifyContent:'center',gap:5,paddingVertical:8}}>
        <Icon name={icon} size={19} color={on?C.blue:C.ink}/>
        <Txt lang={lang} weight="900" floor={13} style={{fontSize:14,textAlign:'center',color:on?C.blue:C.ink}}>{tr(lang,ar,en,es)}</Txt>
      </Pressable>})}
    </View>
  </Card>;
}
