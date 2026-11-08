import {Alert,Platform} from 'react-native';
export function confirmAction({title,message,confirmLabel,cancelLabel,onConfirm}){
 if(Platform.OS==='web') {if(typeof globalThis.confirm==='function'&&globalThis.confirm(`${title}\n${message}`))onConfirm();return;}
 Alert.alert(title,message,[{text:cancelLabel,style:'cancel'},{text:confirmLabel,style:'destructive',onPress:onConfirm}]);
}
