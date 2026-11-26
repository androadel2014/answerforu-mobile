import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Round 9 — 3.7.2 (versionCode 21): follow-up to the owner's QA of 3.7.1 against live website 6.4.2.
// Item 4: Android automatic dark mode (expo-system-ui) + dark launch screen; item 5: the 8-character
// password rule end to end; item 6: device-test preparation (picker sheet, keyboard, voice hint,
// hosted-only currency photos).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const json = (f) => JSON.parse(read(f));

test('release: 3.7.2 / versionCode 21 / website 6.4.3', () => {
  const app = json('app.json').expo, pkg = json('package.json');
  assert.equal(pkg.version, '3.7.2'); assert.equal(app.version, '3.7.2'); assert.equal(app.extra.cleanMobileVersion, '3.7.2');
  assert.equal(app.android.versionCode, 21); assert.equal(app.extra.webMasterVersion, '6.4.3');
  assert.match(read('src/config.js'), /APP_VERSION = "3\.7\.2"/); assert.match(read('src/config.js'), /WEB_MASTER_VERSION = "6\.4\.3"/);
  assert.equal(app.android.permissions, undefined, 'no new Android permission');
});

test('item 4: expo-system-ui and expo-splash-screen at SDK 58, lockfile in sync (installed with npx expo install)', () => {
  const pkg = json('package.json'), lock = json('package-lock.json');
  assert.equal(pkg.dependencies['expo-system-ui'], '~58.0.7');
  assert.equal(pkg.dependencies['expo-splash-screen'], '~58.0.14');
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies, 'npm ci needs package.json and the lock in sync');
  assert.equal(lock.version, '3.7.2'); assert.equal(lock.packages[''].version, '3.7.2');
  for (const name of ['expo-system-ui', 'expo-splash-screen']) {
    const entry = lock.packages[`node_modules/${name}`];
    assert.ok(entry && /^58\./.test(entry.version) && /^sha512-/.test(entry.integrity) && entry.resolved.startsWith('https://registry.npmjs.org/'), name);
  }
});

test('item 4: automatic appearance on Android, dark launch screen from existing artwork', () => {
  const app = json('app.json').expo;
  assert.equal(app.userInterfaceStyle, 'automatic');
  assert.ok(app.plugins.includes('expo-system-ui'), 'expo-system-ui config plugin');
  const splash = app.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  assert.ok(splash, 'expo-splash-screen configured');
  const cfg = splash[1];
  assert.equal(cfg.backgroundColor, '#FAF3E0', 'light launch screen = the app light background (cream)');
  assert.equal(cfg.dark.backgroundColor, '#0B1220', 'dark launch screen = the app dark background');
  for (const img of [cfg.image, cfg.dark.image]) assert.ok(fs.existsSync(path.join(root, img)), img);
  assert.match(read('src/theme.js'), /cream: "#FAF3E0"/); assert.match(read('src/theme.js'), /cream: "#0B1220"/);
});

test('item 4: the window background and native dialogs follow the appearance', () => {
  const app = read('App.js');
  assert.match(app, /import \* as SystemUI from "expo-system-ui";/);
  assert.match(app, /SystemUI\.setBackgroundColorAsync\(C\.bg\)/);
  assert.match(app, /\[resolvedTheme\]\);/);
  assert.match(app, /Appearance\.setColorScheme\(themePref==="light"\|\|themePref==="dark"\?themePref:"auto"\)/);
  assert.match(app, /try\{if\(typeof Appearance\?\.setColorScheme==="function"\)/, 'guarded: never crashes on an older runtime');
});

test('item 5: the app counts password characters like the server (code points; UTF-8 bytes for the maximum)', async () => {
  const { validatePassword, passwordLength, passwordBytes, passwordStrength } = await import('../src/logic/passwordPolicy.mjs');
  assert.equal(passwordLength('Abc!12\u{1F600}'), 7); assert.equal('Abc!12\u{1F600}'.length, 8);
  assert.equal(validatePassword('Abc!12\u{1F600}').reason, 'short', 'server: mb_strlen 7 -> PASSWORD_TOO_SHORT');
  assert.equal(validatePassword('Abc!123\u{1F600}').ok, true);
  assert.equal(passwordBytes('ب'.repeat(2048)), 4096);
  assert.equal(validatePassword('ب'.repeat(2049)).reason, 'long', 'server: strlen 4098 > 4096 -> PASSWORD_TOO_LONG');
  assert.equal(passwordStrength('Abc!12\u{1F600}').level, 'short');
  const web = path.join(root, '../AnswerForU-v6.4.1/source-original/src/lib/passwordPolicy.js');
  if (fs.existsSync(web)) {
    const body = (s) => s.slice(s.indexOf('export function passwordLength'));
    assert.equal(body(read('src/logic/passwordPolicy.mjs')), body(fs.readFileSync(web, 'utf8')), 'same code as the website');
  }
});

test('item 5: every server password code is shown in the app language (no stale "12 characters")', () => {
  const pi = read('src/components/PasswordInput.js');
  for (const code of ['PASSWORD_TOO_SHORT', 'PASSWORD_TOO_LONG', 'PASSWORD_TOO_COMMON', 'PASSWORD_IS_PERSONAL']) assert.match(pi, new RegExp(`${code}:'`), code);
  const php = path.join(root, '../AnswerForU-v6.4.1/public/api/password-change.php');
  if (fs.existsSync(php)) {
    const codes = [...new Set(fs.readFileSync(php, 'utf8').match(/'PASSWORD_(?:TOO_\w+|IS_\w+)'/g))].map((x) => x.slice(1, -1));
    for (const code of codes) assert.match(pi, new RegExp(`${code}:'`), `server code ${code} handled by the app`);
  }
  const auth = read('src/screens/AuthScreen.js'), prof = read('src/screens/ProfileScreen.js');
  assert.match(auth, /setError\(passwordServerProblem\(lang,e\)\|\|friendlyError\(e,lang\)\)/);
  assert.match(prof, /\|\|passwordServerProblem\(lang,e\)\|\|friendlyError\(e,lang\)/);
  for (const f of ['src/screens/ProfileScreen.js', 'src/screens/AuthScreen.js', 'src/components/PasswordInput.js']) assert.doesNotMatch(read(f), /12 (characters|caracteres|حرف)/, f);
});

test('item 5: live verification script ships, refuses production without explicit consent, dry-run works', () => {
  const script = read('scripts/verify-live-password-rule.mjs');
  assert.match(script, /--yes-create-test-account/); assert.match(script, /DELETE', '\/api\/auth\/account'/);
  assert.match(script, /\/api\/auth\/register/); assert.match(script, /\/api\/auth\/change-password/);
  assert.match(read('VERIFY-LIVE-PASSWORD-RULE.bat'), /verify-live-password-rule\.mjs --email "%AFU_QA_EMAIL%" --yes-create-test-account/);
  const out = execFileSync(process.execPath, [path.join(root, 'scripts/verify-live-password-rule.mjs'), '--dry-run'], { encoding: 'utf8' });
  assert.match(out, /Dry run — no request sent/); assert.match(out, /7 characters incl\. an emoji \(8 UTF-16 units\)\s+refuse \(short\)/);
  let refused = false;
  try { execFileSync(process.execPath, [path.join(root, 'scripts/verify-live-password-rule.mjs'), '--email', 'qa@example.com'], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { refused = e.status === 2; }
  assert.ok(refused, 'no production run without --yes-create-test-account');
});

test('item 6: picker sheet — backdrop behind the sheet, keyboard-aware, clear of the navigation bar', () => {
  const s = read('src/components/FormPickers.js');
  const sheet = s.slice(s.indexOf('function Sheet('), s.indexOf('const cell='));
  assert.match(sheet, /<KeyboardAvoidingView behavior="padding" style=\{\{flex:1\}\}>/);
  assert.match(sheet, /style=\{\[StyleSheet\.absoluteFill,\{backgroundColor:'rgba\(0,0,0,\.45\)'\}\]\}\/>/, 'backdrop is a self-closed sibling');
  assert.doesNotMatch(sheet, /<Pressable onPress=\{\(\)=>\{\}\}/, 'no Pressable wrapped around the sheet content');
  assert.match(sheet, /paddingBottom:16\+\(insets\?\.bottom\|\|0\)/);
  assert.match(s, /keyboardShouldPersistTaps="handled" style=\{\{maxHeight:380,flexShrink:1\}\}/, 'state list shrinks above the keyboard, first tap selects');
  assert.match(s, /keyboardShouldPersistTaps="handled" style=\{\{maxHeight:340,flexShrink:1\}\}/);
});

test('item 6: currency photos only from AnswerForU (same rule as website 6.4.3)', async () => {
  const { hostedCurrencyPhoto } = await import('../src/logic/currencyPhotos.mjs');
  assert.equal(hostedCurrencyPhoto('https://answerforu.com/learn-assets/currency/penny-back.jpg'), 'https://answerforu.com/learn-assets/currency/penny-back.jpg');
  assert.equal(hostedCurrencyPhoto('/api/learn/currency-photo?item=dime&side=back'), '/api/learn/currency-photo?item=dime&side=back');
  for (const u of ['https://www.usmint.gov/x.jpg', 'https://www.uscurrency.gov/y.jpg', '//usmint.gov/z.jpg', 'javascript:alert(1)', '', null]) assert.equal(hostedCurrencyPhoto(u), '', String(u));
  const learn = read('src/screens/LearnScreen.js');
  assert.match(learn, /const photo = hostedCurrencyPhoto\(item\?\.\[`\$\{side\}_local`\]\) \|\| hostedCurrencyPhoto\(item\?\.\[side\]\);/);
  assert.match(learn, /const fallback = hostedCurrencyPhoto\(item\?\.\[`\$\{side\}_fallback`\]\);/);
  assert.doesNotMatch(learn.slice(learn.indexOf('function Currency(')), /_official_url`\] \|\| item\?\.\[side\]/);
  const web = path.join(root, '../AnswerForU-v6.4.1/source-original/src/features/learn/lib/currencySources.js');
  if (fs.existsSync(web)) {
    const fn = (s) => s.slice(s.indexOf('export function hostedCurrencyPhoto'), s.indexOf('\n}\n', s.indexOf('export function hostedCurrencyPhoto'))).replace(/'/g, '"');
    assert.equal(fn(read('src/logic/currencyPhotos.mjs')), fn(fs.readFileSync(web, 'utf8')), 'same rule as the website');
  }
});

test('item 6: a phone without an English voice gets a one-line hint (never a false alarm)', () => {
  const check = read('src/services/voiceCheck.js'), speed = read('src/components/VoiceSpeed.js');
  assert.match(check, /Speech\.getAvailableVoicesAsync\(\)/);
  assert.match(check, /if \(!Array\.isArray\(voices\) \|\| voices\.length === 0\) return null;/, 'unknown is not missing');
  assert.match(speed, /hasVoiceFor\('en'\)\.then\(ok=>\{if\(live\)setNoVoice\(ok===false\)\}\)/);
  assert.match(speed, /No English voice is installed on this phone/);
  assert.match(read('src/services/voice.js'), /const language=lang==='ar'\?'ar':lang==='es'\?'es-US':'en-US';/, 'speech language unchanged');
});

test('item 6: device-test plan covers the five areas and the known weak spots', () => {
  const plan = read('DEVICE-TEST-PLAN.md');
  for (const area of ['Right-to-left', 'Dark mode', 'Date and state pickers', 'Excel and Word', 'Audio']) assert.match(plan, new RegExp(area), area);
  assert.match(plan, /BUILD-PREVIEW-APK\.bat/); assert.match(plan, /3\.7\.2/); assert.match(plan, /npx expo config --type introspect/);
});
