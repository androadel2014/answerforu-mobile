import React from 'react';
import {Text,View} from 'react-native';
import {signPalette as P} from '../theme';
/**
 * AnswerForU mobile 3.7.1 — tester items 11 + 12.
 * Every road sign sits on the same padded white tile (photos used to touch the card edges), and
 * the 30 signs that have no photo in the content (from "NO RIGHT TURN" onward the lesson showed
 * no picture at all) are drawn from their own data: shape, colour and legend.
 * Shapes: diamond (warning), rectangle (regulatory / guide), octagon, triangle, circle/round.
 */
const FACE={yellow:[P.yellow,P.black],orange:[P.orange,P.black],white:[P.white,P.black],red:[P.red,P.white],green:[P.green,P.white],blue:[P.blue,P.white],black:[P.black,P.white]};
function Legend({label,color,size,maxWidth}){
  const lines=String(label||'').split('\n').filter(Boolean);
  const longest=Math.max(4,...lines.map(l=>l.length));
  const fontSize=Math.max(12,Math.min(size*.2,(maxWidth/longest)*1.55,size*.62/Math.max(1,lines.length)));
  return <View style={{alignItems:'center',justifyContent:'center',maxWidth}}>{lines.map((line,i)=><Text key={i} allowFontScaling={false} style={{color,fontWeight:'900',fontSize,lineHeight:Math.round(fontSize*1.08),textAlign:'center',letterSpacing:-.2}}>{line}</Text>)}</View>;
}
export function SignGraphic({shape='rectangle',color='white',label='',size=150}){
  const [bg,fg]=FACE[color]||FACE.white;
  if(shape==='diamond'){
    const side=Math.round(size*.68);
    return <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
      <View style={{position:'absolute',width:side,height:side,backgroundColor:bg,borderRadius:8,borderWidth:3,borderColor:fg,transform:[{rotate:'45deg'}]}}/>
      <View style={{position:'absolute',width:side-14,height:side-14,borderRadius:6,borderWidth:2,borderColor:fg,transform:[{rotate:'45deg'}]}}/>
      <Legend label={label} color={fg} size={size} maxWidth={size*.6}/>
    </View>;
  }
  if(shape==='octagon'||shape==='circle'||shape==='round'){
    const d=Math.round(size*.86);
    return <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
      <View style={{width:d,height:d,borderRadius:shape==='octagon'?d*.3:d/2,backgroundColor:bg,borderWidth:4,borderColor:shape==='octagon'?P.white:fg,alignItems:'center',justifyContent:'center'}}><Legend label={label} color={fg} size={size} maxWidth={d*.8}/></View>
    </View>;
  }
  if(shape==='triangle'){
    return <View style={{width:size,height:size,alignItems:'center',justifyContent:'flex-start',paddingTop:size*.08}}>
      <View style={{width:0,height:0,borderLeftWidth:size*.46,borderRightWidth:size*.46,borderTopWidth:size*.8,borderLeftColor:'transparent',borderRightColor:'transparent',borderTopColor:bg}}/>
      <View style={{position:'absolute',top:size*.08+size*.12,width:0,height:0,borderLeftWidth:size*.3,borderRightWidth:size*.3,borderTopWidth:size*.52,borderLeftColor:'transparent',borderRightColor:'transparent',borderTopColor:P.white}}/>
      <View style={{position:'absolute',top:size*.24}}><Legend label={label} color={bg} size={size*.6} maxWidth={size*.42}/></View>
    </View>;
  }
  const w=Math.round(size*.72),h=Math.round(size*.9);
  return <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
    <View style={{width:w,height:h,backgroundColor:bg,borderRadius:8,padding:4,alignItems:'center',justifyContent:'center'}}>
      <View style={{flex:1,alignSelf:'stretch',borderWidth:2.5,borderColor:fg,borderRadius:5,alignItems:'center',justifyContent:'center',paddingHorizontal:4}}><Legend label={label} color={fg} size={size} maxWidth={w-14}/></View>
    </View>
  </View>;
}
/** Padded white tile used for every sign — photo or drawing — so nothing touches the card edge. */
export default function SignTile({children,height=200,label}){
  return <View accessible accessibilityRole="image" accessibilityLabel={label} style={{height,alignSelf:'stretch',backgroundColor:P.tile,borderRadius:14,borderWidth:1,borderColor:P.tileLine,padding:16,alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{children}</View>;
}
