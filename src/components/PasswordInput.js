import React,{useState} from 'react';
import {Pressable,View} from 'react-native';
import {AwareTextInput,Icon,Txt} from './UI';
import {C} from '../theme';
import {tr,isRTL} from '../i18n';
import {PASSWORD_MIN_LENGTH,passwordStrength,validatePassword} from '../logic/passwordPolicy.mjs';
/**
 * AnswerForU mobile 3.7.1 — tester item 16 (owner decision: minimum 8 characters, a show/hide
 * button and a strength meter). Same policy and common-password list as the website and the API.
 */
export function passwordProblem(lang,password,context={}){
  const r=validatePassword(password,context);
  if(r.ok)return '';
  return {
    short:tr(lang,`كلمة المرور لازم تكون ${PASSWORD_MIN_LENGTH} حروف على الأقل.`,`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`),
    long:tr(lang,'كلمة المرور طويلة جدًا.','Password is too long.','La contraseña es demasiado larga.'),
    common:tr(lang,'كلمة المرور دي مشهورة وسهل تخمينها — اختار غيرها.','This password is too common and easy to guess — choose another.','Esta contraseña es muy común; elige otra.'),
    personal:tr(lang,'ما تستخدمش اسمك أو بريدك ككلمة مرور.','Do not use your name or email as the password.','No uses tu nombre ni tu correo como contraseña.'),
  }[r.reason]||'';
}
export default function PasswordInput({lang='ar',label,value,onChangeText,meter=false,context={},placeholder,autoComplete='password',textContentType='password'}){
  const [shown,setShown]=useState(false);
  const strength=passwordStrength(value,context);
  const words={empty:'',short:tr(lang,'قصيرة','Too short','Muy corta'),weak:tr(lang,'ضعيفة','Weak','Débil'),fair:tr(lang,'مقبولة','Fair','Aceptable'),good:tr(lang,'جيدة','Good','Buena'),strong:tr(lang,'قوية','Strong','Fuerte')};
  const colors=[C.red,C.red,C.goldDeep,C.royal,C.green];
  return <View style={{gap:8}}>
    {label?<Txt lang={lang} style={{fontSize:16,color:C.muted}} weight="800">{label}</Txt>:null}
    <View style={{flexDirection:'row',alignItems:'center',minHeight:54,borderWidth:1.3,borderColor:C.inputBorder,borderRadius:13,backgroundColor:C.paper}}>
      <AwareTextInput value={value} onChangeText={onChangeText} secureTextEntry={!shown} autoCapitalize="none" autoCorrect={false} autoComplete={autoComplete} textContentType={textContentType} placeholder={placeholder} placeholderTextColor={C.placeholder} textAlign={isRTL(lang)?'right':'left'} style={{flex:1,minHeight:52,paddingHorizontal:16,color:C.ink,fontSize:16}}/>
      <Pressable accessibilityRole="button" accessibilityLabel={shown?tr(lang,'إخفاء كلمة المرور','Hide password','Ocultar contraseña'):tr(lang,'إظهار كلمة المرور','Show password','Mostrar contraseña')} onPress={()=>setShown(v=>!v)} style={{width:52,minHeight:52,alignItems:'center',justifyContent:'center'}}>
        <Icon name={shown?'eye-off':'eye'} size={20} color={C.blue}/>
      </Pressable>
    </View>
    {meter?<View style={{gap:5}}>
      <View accessibilityRole="progressbar" accessibilityValue={{min:0,max:4,now:strength.score}} accessibilityLabel={tr(lang,'قوة كلمة المرور','Password strength','Seguridad de la contraseña')} style={{flexDirection:'row',gap:4}}>{[1,2,3,4].map(n=><View key={n} style={{flex:1,height:6,borderRadius:3,backgroundColor:value&&strength.score>=n?colors[strength.score]:C.line}}/>)}</View>
      <Txt lang={lang} floor={13} style={{fontSize:13,color:C.muted}}>{value?`${tr(lang,'القوة','Strength','Seguridad')}: ${words[strength.level]||''} · `:''}{tr(lang,`${PASSWORD_MIN_LENGTH} حروف على الأقل — الأطول أقوى.`,`At least ${PASSWORD_MIN_LENGTH} characters — longer is stronger.`,`Mínimo ${PASSWORD_MIN_LENGTH} caracteres; más larga es más segura.`)}</Txt>
    </View>:null}
  </View>;
}
