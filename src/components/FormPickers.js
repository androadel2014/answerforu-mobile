import React,{useMemo,useState} from 'react';
import {KeyboardAvoidingView,Modal,Pressable,ScrollView,StyleSheet,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Btn,Icon,Txt} from './UI';
import {C} from '../theme';
import {tr,isRTL} from '../i18n';
import {addMonths,compareISO,formatDisplayDate,formatDisplayMonth,isValidISODate,monthGrid,monthNames,parseISODate,parseMonthYear,formatMonthYear,toISODate,todayISO,weekdayNames} from '../logic/dates.mjs';
import {searchStates,stateLabel} from '../logic/usStates.mjs';
/**
 * AnswerForU mobile 3.7.1 — tester item 1 (every date is a calendar), item 4 (the state is a
 * searchable list of state names) and item 15 (citizenship dates). Pure JavaScript pickers built
 * from React Native views: no new native dependency, same look on Android and iOS, Arabic RTL,
 * and the same date logic as the website (src/logic/dates.mjs).
 */
const dirOf=lang=>({direction:isRTL(lang)?'rtl':'ltr'});
function FieldShell({lang,label,text,placeholder,icon,onPress,invalid,accessibilityLabel}){
  return <View style={{gap:8}}>
    {label?<Txt lang={lang} style={{fontSize:16,color:C.muted}} weight="800">{label}</Txt>:null}
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel||label} onPress={onPress} style={{minHeight:54,borderWidth:1.3,borderColor:invalid?C.red:C.inputBorder,borderRadius:13,backgroundColor:C.paper,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:10}}>
      <Icon name={icon} size={19} color={C.blue}/>
      <Txt lang={lang} style={{flex:1,color:text?C.ink:C.placeholder}} weight={text?'800':'600'}>{text||placeholder}</Txt>
      <Icon name="chevron-down" size={18} color={C.muted}/>
    </Pressable>
  </View>;
}
function Sheet({lang,visible,onClose,title,children,footer}){
  // 3.7.2 (device-test prep): the dimmed backdrop is a sibling BEHIND the sheet instead of wrapping
  // it — a wrapping Pressable can swallow scroll gestures on Android (state list, year grid). The
  // keyboard-avoiding view lifts the sheet above the keyboard (state search) and the bottom inset
  // keeps the buttons clear of the navigation bar.
  const insets=useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
      <View style={{flex:1,justifyContent:'flex-end'}}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,'إغلاق','Close','Cerrar')} onPress={onClose} style={[StyleSheet.absoluteFill,{backgroundColor:'rgba(0,0,0,.45)'}]}/>
        <View style={[{backgroundColor:C.bg,borderTopLeftRadius:22,borderTopRightRadius:22,padding:16,paddingBottom:16+(insets?.bottom||0),gap:12,maxHeight:'88%'},dirOf(lang)]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}><Txt lang={lang} weight="900" style={{fontSize:18,flex:1}}>{title}</Txt><Pressable accessibilityRole="button" accessibilityLabel={tr(lang,'إغلاق','Close','Cerrar')} onPress={onClose} style={{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',backgroundColor:C.paper}}><Icon name="x" size={20} color={C.ink}/></Pressable></View>
          {children}
          {footer}
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const cell={width:'14.2857%',aspectRatio:1,alignItems:'center',justifyContent:'center'};

/** Calendar date field. value / onChange use ISO dates (YYYY-MM-DD). */
export function DateField({lang='ar',label,value,onChange,min,max,placeholder,defaultView,allowClear=true}){
  const [open,setOpen]=useState(false);
  const [mode,setMode]=useState('days');
  const selected=isValidISODate(value)?value:'';
  const start=parseISODate(selected)||parseISODate(defaultView)||parseISODate(max&&compareISO(todayISO(),max)>0?max:todayISO());
  const [view,setView]=useState({year:start.year,month:start.month});
  const show=()=>{const p=parseISODate(selected)||parseISODate(defaultView)||parseISODate(max&&compareISO(todayISO(),max)>0?max:todayISO());setView({year:p.year,month:p.month});setMode('days');setOpen(true);};
  const allowed=iso=>(!min||compareISO(iso,min)>=0)&&(!max||compareISO(iso,max)<=0);
  const pick=iso=>{if(!allowed(iso))return;onChange?.(iso);setOpen(false);};
  const minYear=parseISODate(min)?.year||1920,maxYear=parseISODate(max)?.year||new Date().getFullYear()+10;
  const years=useMemo(()=>{const out=[];for(let y=maxYear;y>=minYear;y--)out.push(y);return out;},[minYear,maxYear]);
  const rtl=isRTL(lang);
  const grid=monthGrid(view.year,view.month);
  const today=todayISO();
  const step=delta=>setView(v=>addMonths(v,delta));
  return <View>
    <FieldShell lang={lang} label={label} icon="calendar" text={selected?formatDisplayDate(selected,lang):''} placeholder={placeholder||tr(lang,'اختر التاريخ من التقويم','Pick a date','Elige una fecha')} onPress={show}/>
    <Sheet lang={lang} visible={open} onClose={()=>setOpen(false)} title={label||tr(lang,'اختر التاريخ','Pick a date','Elige una fecha')}
      footer={<View style={{flexDirection:'row',gap:8}}>
        {allowed(today)?<View style={{flex:1}}><Btn lang={lang} variant="light" title={tr(lang,'اليوم','Today','Hoy')} onPress={()=>pick(today)}/></View>:null}
        {allowClear&&selected?<View style={{flex:1}}><Btn lang={lang} variant="ghost" title={tr(lang,'مسح','Clear','Borrar')} onPress={()=>{onChange?.('');setOpen(false);}}/></View>:null}
      </View>}>
      <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,'الشهر السابق','Previous month','Mes anterior')} onPress={()=>step(-1)} style={navBtn}><Icon name={rtl?'chevron-right':'chevron-left'} size={22} color={C.ink}/></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,'اختيار السنة','Choose the year','Elegir el año')} onPress={()=>setMode(m=>m==='years'?'days':'years')} style={{flex:1,minHeight:44,borderRadius:12,backgroundColor:C.paper,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:6}}>
          <Txt lang={lang} weight="900" style={{fontSize:17}}>{formatDisplayMonth(view.year,view.month,lang)}</Txt><Icon name={mode==='years'?'chevron-up':'chevron-down'} size={16} color={C.blue}/>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,'الشهر التالي','Next month','Mes siguiente')} onPress={()=>step(1)} style={navBtn}><Icon name={rtl?'chevron-left':'chevron-right'} size={22} color={C.ink}/></Pressable>
      </View>
      {mode==='years'?<ScrollView keyboardShouldPersistTaps="handled" style={{maxHeight:340,flexShrink:1}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',gap:8,paddingBottom:6}}>
        {years.map(y=><Pressable key={y} accessibilityRole="button" accessibilityState={{selected:y===view.year}} onPress={()=>{setView(v=>({...v,year:y}));setMode('months');}} style={[chip,y===view.year&&chipOn()]}><Txt weight="900" style={{color:y===view.year?C.onDark:C.ink,textAlign:'center'}}>{String(y)}</Txt></Pressable>)}
      </ScrollView>:mode==='months'?<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {monthNames(lang).map((name,m)=><Pressable key={name} accessibilityRole="button" onPress={()=>{setView(v=>({...v,month:m}));setMode('days');}} style={[chip,{width:'31%'},m===view.month&&chipOn()]}><Txt lang={lang} weight="800" style={{color:m===view.month?C.onDark:C.ink,textAlign:'center'}}>{name}</Txt></Pressable>)}
      </View>:<View>
        <View style={{flexDirection:'row'}}>{weekdayNames(lang).map(d=><View key={d} style={[cell,{aspectRatio:undefined,height:30}]}><Txt lang={lang} floor={12} weight="900" style={{fontSize:12,color:C.muted,textAlign:'center'}}>{d}</Txt></View>)}</View>
        <View style={{flexDirection:'row',flexWrap:'wrap'}}>{grid.map((day,i)=>{if(!day)return <View key={`e${i}`} style={cell}/>;const iso=toISODate(view.year,view.month,day);const on=iso===selected,ok=allowed(iso),isToday=iso===today;return <Pressable key={iso} accessibilityRole="button" accessibilityLabel={formatDisplayDate(iso,lang)} accessibilityState={{selected:on,disabled:!ok}} disabled={!ok} onPress={()=>pick(iso)} style={cell}>
          <View style={{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',backgroundColor:on?C.royal:'transparent',borderWidth:isToday&&!on?1.5:0,borderColor:C.royal,opacity:ok?1:.3}}><Txt weight={on?'900':'700'} style={{color:on?C.onDark:C.ink,textAlign:'center',fontSize:16}}>{String(day)}</Txt></View>
        </Pressable>;})}</View>
      </View>}
    </Sheet>
  </View>;
}
const navBtn={width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'};
const chip={width:'22.5%',minHeight:44,borderRadius:12,borderWidth:1,borderColor:'transparent',alignItems:'center',justifyContent:'center'};
const chipOn=()=>({backgroundColor:C.royal});

/** Month + year for résumé dates ("Mar 2021", "2019", "Present"); free text is parsed when possible. */
export function MonthYearField({lang='ar',label,value,onChange,allowPresent=false}){
  const [open,setOpen]=useState(false);
  const parsed=parseMonthYear(value);
  const now=new Date().getFullYear();
  const [year,setYear]=useState(parsed?.year||now);
  const years=useMemo(()=>{const out=[];for(let y=now+6;y>=now-60;y--)out.push(y);return out;},[now]);
  const text=parsed?.present?tr(lang,'حتى الآن','Present','Actualidad'):parsed?(parsed.month==null?String(parsed.year):formatDisplayMonth(parsed.year,parsed.month,lang)):String(value||'');
  const set=v=>{onChange?.(v);setOpen(false);};
  return <View>
    <FieldShell lang={lang} label={label} icon="calendar" text={text} placeholder={tr(lang,'اختر الشهر والسنة','Pick month and year','Elige mes y año')} onPress={()=>{setYear(parseMonthYear(value)?.year||now);setOpen(true);}}/>
    <Sheet lang={lang} visible={open} onClose={()=>setOpen(false)} title={label||tr(lang,'الشهر والسنة','Month and year','Mes y año')}
      footer={<View style={{flexDirection:'row',gap:8}}>
        {allowPresent?<View style={{flex:1}}><Btn lang={lang} variant="blue" title={tr(lang,'حتى الآن','Present','Actualidad')} onPress={()=>set('Present')}/></View>:null}
        <View style={{flex:1}}><Btn lang={lang} variant="light" title={tr(lang,'السنة فقط','Year only','Solo el año')} onPress={()=>set(String(year))}/></View>
        {value?<View style={{flex:1}}><Btn lang={lang} variant="ghost" title={tr(lang,'مسح','Clear','Borrar')} onPress={()=>set('')}/></View>:null}
      </View>}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,direction:'ltr'}} contentContainerStyle={{gap:8,paddingVertical:2}}>
        {years.map(y=><Pressable key={y} accessibilityRole="button" accessibilityState={{selected:y===year}} onPress={()=>setYear(y)} style={[{minWidth:70,minHeight:44,borderRadius:12,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.line,backgroundColor:C.paper},y===year&&chipOn()]}><Txt weight="900" style={{color:y===year?C.onDark:C.ink}}>{String(y)}</Txt></Pressable>)}
      </ScrollView>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{monthNames(lang).map((name,m)=>{const on=parsed&&!parsed.present&&parsed.year===year&&parsed.month===m;return <Pressable key={name} accessibilityRole="button" onPress={()=>set(formatMonthYear({year,month:m}))} style={[chip,{width:'31%',borderColor:C.line,backgroundColor:C.paper},on&&chipOn()]}><Txt lang={lang} weight="800" style={{color:on?C.onDark:C.ink,textAlign:'center'}}>{name}</Txt></Pressable>;})}</View>
    </Sheet>
  </View>;
}

/** Searchable list of the 50 states + DC (Arabic, English and Spanish names, or the code). */
export function StatePicker({lang='ar',label,value,onChange,placeholder,allowEmpty=false,emptyLabel}){
  const [open,setOpen]=useState(false),[query,setQuery]=useState('');
  const code=String(value||'').toUpperCase();
  const results=useMemo(()=>searchStates(query,lang),[query,lang]);
  const text=code?`${stateLabel(code,lang)} (${code})`:'';
  const choose=v=>{onChange?.(v);setOpen(false);setQuery('');};
  return <View>
    <FieldShell lang={lang} label={label} icon="map-pin" text={text} placeholder={placeholder||tr(lang,'اختر الولاية','Choose a state','Elige un estado')} onPress={()=>setOpen(true)}/>
    <Sheet lang={lang} visible={open} onClose={()=>setOpen(false)} title={label||tr(lang,'الولاية','State','Estado')}>
      <TextInput autoFocus value={query} onChangeText={setQuery} placeholder={tr(lang,'ابحث باسم الولاية أو الرمز (VA)','Search by name or code (VA)','Busca por nombre o código (VA)')} placeholderTextColor={C.placeholder} textAlign={isRTL(lang)?'right':'left'} style={{minHeight:50,borderRadius:13,borderWidth:1.3,borderColor:C.inputBorder,backgroundColor:C.paper,paddingHorizontal:14,color:C.ink,fontSize:16}}/>
      <ScrollView keyboardShouldPersistTaps="handled" style={{maxHeight:380,flexShrink:1}}>
        {allowEmpty?<Pressable accessibilityRole="button" onPress={()=>choose('')} style={row}><Txt lang={lang} weight="800" style={{color:C.blue}}>{emptyLabel||tr(lang,'كل الولايات','All states','Todos los estados')}</Txt></Pressable>:null}
        {results.map(o=><Pressable key={o.code} accessibilityRole="button" accessibilityState={{selected:o.code===code}} onPress={()=>choose(o.code)} style={[row,o.code===code&&{backgroundColor:C.royalSoft}]}>
          <Txt lang={lang} weight="800" style={{flex:1}}>{o.label}</Txt><Txt weight="900" style={{color:C.muted}}>{o.code}</Txt>
        </Pressable>)}
        {!results.length?<Txt lang={lang} style={{color:C.muted,padding:12}}>{tr(lang,'لا توجد ولاية بهذا الاسم','No state matches','Ningún estado coincide')}</Txt>:null}
      </ScrollView>
    </Sheet>
  </View>;
}
const row={flexDirection:'row',alignItems:'center',gap:10,minHeight:50,paddingHorizontal:12,borderRadius:12};
