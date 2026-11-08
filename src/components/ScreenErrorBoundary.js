import React from 'react';
import {View} from 'react-native';
import {Btn,Card,Txt} from './UI';
import {tr} from '../i18n';
import {C} from '../theme';
export default class ScreenErrorBoundary extends React.Component{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){/* Native error details are never exposed to users. */}
  retry=()=>{this.setState({failed:false});this.props.onRetry?.()};
  render(){const lang=this.props.lang||'ar';if(!this.state.failed)return this.props.children;
    return <View style={{flex:1,padding:16,justifyContent:'center',backgroundColor:C.bg}}><Card style={{gap:14}}><Txt lang={lang} style={{fontSize:20}} weight="900">{tr(lang,'تعذر فتح القسم','Could not open this section','No se pudo abrir esta sección')}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:24}}>{tr(lang,'البيانات أو الاتصال غير متاح حاليًا. تقدر تعيد المحاولة أو ترجع للرئيسية.','Content or connection is unavailable. Retry or return home.','El contenido o la conexión no está disponible. Reintenta o vuelve al inicio.')}</Txt><Btn lang={lang} title={tr(lang,'إعادة المحاولة','Retry','Reintentar')} onPress={this.retry} variant="blue"/><Btn lang={lang} title={tr(lang,'الرئيسية','Home','Inicio')} onPress={this.props.onHome} variant="light"/></Card></View>;
  }
}
