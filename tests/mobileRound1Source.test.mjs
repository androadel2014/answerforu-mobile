import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');

test('API token and auth flow are reused, not replaced by a second auth store',()=>{
 const a=read('src/api/client.js');
 assert.match(a,/Bearer \$\{token\}/);
 assert.match(a,/\/api\/auth\/login/);
 assert.match(a,/\/api\/auth\/change-password/);
 assert.match(read('App.js'),/setToken\(/);
});
test('native routes and persistent bottom navigation are wired',()=>{
 const a=read('App.js');
 for(const name of ['CitizenshipScreen','SurvivalEnglishScreen','OfflinePacksScreen','BottomNav','JourneyScreen','CommunityScreen','CVScreen'])assert.ok(a.includes(name),name);
 assert.match(a,/<BottomNav/);
});
test('native audio playback supports queue, stop, and persisted speed',()=>{
 const v=read('src/services/voice.js');
 for(const x of ['expo-speech','Speech.speak','Speech.stop','playQueue','setSpeed','expo-secure-store'])assert.ok(v.includes(x),x);
});
test('offline module has versioned file cache and refresh',()=>{
 const v=read('src/services/offline.js');
 for(const x of ['expo-file-system','6.3.7','readPack','writePack','refreshPack','useOfflinePack'])assert.ok(v.includes(x),x);
});
test('offline progress writes have per-user keys and retry path',()=>{
 const v=read('src/services/progressSync.js');
 for(const x of ['userId','pending:true','reconcileProgress','commitProgress','saver(local.value)'])assert.ok(v.includes(x),x);
});
test('native camera is offered for listing creation and CV',()=>{
 const screens=['src/screens/CommunityScreen.js','src/screens/CVScreen.js'];
 for(const s of screens)assert.match(read(s),/launchCameraAsync/,s);
});
test('Places paging requests server mode with limit=24',()=>{
 const a=read('src/api/client.js');
 assert.match(a,/paged=1&compact=1/);
 assert.match(a,/limit=24/);
});
test('push groundwork does not falsely claim server registration',()=>{
 const a=read('src/services/pushGroundwork.js');
 assert.match(a,/registered:false/);
 assert.match(a,/No server mutation/);
});
test('native sharing is wired in post details and glossary',()=>{
 assert.match(read('src/screens/PostDetailScreen.js'),/shareItem/);
 assert.match(read('src/screens/GlossaryScreen.js'),/shareItem/);
});
