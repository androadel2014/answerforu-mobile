/** Client-side only: the existing /api/notifications is an inbox, not a device-token registration endpoint. */
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
// SDK 58 shows foreground notifications by default; preserve SDK 57's no-handler behavior.
Notifications.setNotificationHandler({
  handleNotification: async () => ({shouldShowBanner:false, shouldShowList:false, shouldPlaySound:false, shouldSetBadge:false}),
});
export async function optInForDeviceNotifications(projectId){
  const permission=await Notifications.requestPermissionsAsync();
  if(!permission.granted)return {granted:false,registered:false};
  if(!projectId)return {granted:true,registered:false,reason:'Expo EAS projectId is required'};
  const result=await Notifications.getExpoPushTokenAsync({projectId});
  await SecureStore.setItemAsync('afu_pending_push_token_v1',result.data);
  // No server mutation: a future authenticated /api/push/register route is needed.
  return {granted:true,registered:false,reason:'Backend push-token registration is not implemented'};
}
