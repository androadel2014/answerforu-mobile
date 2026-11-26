#!/usr/bin/env node
/**
 * AnswerForU app 3.7.2 — end-to-end check of the 8-character password rule against a
 * running AnswerForU server (production or local). Node 18+ (built-in fetch), no packages.
 *
 *   node scripts/verify-live-password-rule.mjs --email you+afuqa@example.com --yes-create-test-account
 *   node scripts/verify-live-password-rule.mjs --base http://127.0.0.1:8000 --email qa@example.com
 *   node scripts/verify-live-password-rule.mjs --dry-run          (no network: plan + the app's own verdicts)
 *
 * What it does — with the app's own requests (src/api/client.js) and the app's own policy
 * (src/logic/passwordPolicy.mjs):
 *   1. register with a 7-character password  -> server must refuse: 422 PASSWORD_TOO_SHORT, no account
 *   2. register again with a valid password   -> 201 (same username + e-mail, so step 1 created nothing)
 *   3. sign in                                 -> 200
 *   4. change password to six samples (short, emoji-short, common, 8 chars, emoji-8, Arabic) and
 *      compare the server's answer with the app's own check for each one (they must agree)
 *   5. the registration password no longer works; the current one does
 *   6. delete the test account (DELETE /api/auth/account with password + "DELETE"), then sign-in fails
 * The account is deleted at the end even when a step fails. Registration sends a verification
 * e-mail to --email, so use an inbox you control. A JSON report (passwords masked) is written to qa/.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PASSWORD_MIN_LENGTH, passwordLength, validatePassword } from '../src/logic/passwordPolicy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const has = (name) => argv.includes(name);
const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
const base = String(arg('--base') || app.extra.apiBaseUrl || '').replace(/\/+$/, '');
const email = String(arg('--email') || '').trim();
const dryRun = has('--dry-run');
const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(base);
const pause = Number(arg('--pause-ms') || (isLocal ? 50 : 900));

// Server error codes for a refused password, and the app's reason for each (PasswordInput.js
// shows the same words for both). Any other code would reach the user as a generic error.
const APP_HANDLED = { PASSWORD_TOO_SHORT: 'short', PASSWORD_TOO_LONG: 'long', PASSWORD_TOO_COMMON: 'common', PASSWORD_IS_PERSONAL: 'personal' };

if (!dryRun && (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
  console.error('Usage: node scripts/verify-live-password-rule.mjs --email <inbox you control> [--base URL] [--yes-create-test-account] | --dry-run');
  process.exit(2);
}
if (!dryRun && !isLocal && !has('--yes-create-test-account')) {
  console.error(`Refusing to create a test account on ${base} without --yes-create-test-account (it is deleted at the end).`);
  process.exit(2);
}

const rnd = (n) => crypto.randomBytes(16).toString('hex').slice(0, n);
const username = `afuqa${rnd(8)}`;
const pw = { registration: `Qa!${rnd(9)}`, sevenChars: `Qa!${rnd(4)}` };
// Samples for the change-password comparison; the label is what the report shows (never the value).
const samples = [
  { label: '7 characters (ASCII)', value: `Qx!${rnd(4)}` },
  { label: '7 characters incl. an emoji (8 UTF-16 units)', value: `Qx!${rnd(3)}\u{1F600}` },
  { label: 'common password (password123)', value: 'password123' },
  { label: '8 characters (ASCII)', value: `Qy!${rnd(5)}` },
  { label: '8 characters incl. an emoji', value: `Qz!${rnd(4)}\u{1F600}` },
  { label: '10 Arabic letters', value: 'كلمةسرقوية' },
];

const results = [];
const record = (step, ok, detail) => { results.push({ step, result: ok ? 'PASS' : 'FAIL', ...detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${step}${detail?.note ? `  — ${detail.note}` : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, route, body, token) {
  await sleep(pause);
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${route}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 200) }; }
  if (res.status === 429) throw new Error('Server throttled the requests (HTTP 429). Wait 15 minutes and run again.');
  return { status: res.status, data, code: data?.code || '' };
}
const tokenOf = (r) => r.data?.token || r.data?.authToken || r.data?.jwt || '';

console.log(`AnswerForU live password-rule check — app ${app.version} (versionCode ${app.android.versionCode}), server ${base || '(none)'}`);
console.log(`App rule: at least ${PASSWORD_MIN_LENGTH} characters, counted like the server (Unicode characters).`);

// 0. The app's own verdicts (no network).
record('app check: 7-character password refused before sending', validatePassword(pw.sevenChars).reason === 'short', { note: `reason=${validatePassword(pw.sevenChars).reason}` });
record('app check: valid password accepted', validatePassword(pw.registration).ok, {});
for (const s of samples) results.push({ step: `app verdict: ${s.label}`, result: 'INFO', app: validatePassword(s.value).ok ? 'accept' : `refuse (${validatePassword(s.value).reason})`, characters: passwordLength(s.value) });
if (dryRun) {
  console.log('\nDry run — no request sent. Samples and the app verdicts:');
  for (const r of results.filter((x) => x.result === 'INFO')) console.log(`  ${r.step.replace('app verdict: ', '').padEnd(48)} ${r.app}`);
  process.exit(results.some((r) => r.result === 'FAIL') ? 1 : 0);
}

let created = false; let deleted = false; let current = '';
try {
  const shortReg = await call('POST', '/api/auth/register', { username, email, password: pw.sevenChars });
  record('server refuses registration with 7 characters', shortReg.status === 422 && shortReg.code === 'PASSWORD_TOO_SHORT', { status: shortReg.status, code: shortReg.code, note: `HTTP ${shortReg.status} ${shortReg.code}` });
  record('server error code is one the app translates', shortReg.code in APP_HANDLED, { code: shortReg.code });
  if (shortReg.status >= 200 && shortReg.status < 300) { created = true; current = pw.sevenChars; }

  const noAccount = await call('POST', '/api/auth/login', { email, password: pw.sevenChars });
  record('no account was created by the refused registration (sign-in fails)', noAccount.status === 401 || noAccount.status === 403 || noAccount.status === 422, { status: noAccount.status, note: `HTTP ${noAccount.status}` });

  const reg = await call('POST', '/api/auth/register', { username, email, password: pw.registration });
  if (reg.status === 201 || reg.status === 200) { created = true; current = pw.registration; }
  record('registration with a valid password succeeds (same username + e-mail)', (reg.status === 201 || reg.status === 200) && !!tokenOf(reg), { status: reg.status, note: `HTTP ${reg.status}` });
  if (!created) throw new Error('Could not create the test account; stopping (see the steps above).');

  const login = await call('POST', '/api/auth/login', { email, password: pw.registration });
  let token = tokenOf(login);
  record('sign in with the valid password', login.status === 200 && !!token, { status: login.status });

  for (const s of samples) {
    const appSays = validatePassword(s.value);
    const r = await call('POST', '/api/auth/change-password', { currentPassword: current, newPassword: s.value, confirmPassword: s.value }, token);
    const serverAccepts = r.status === 200;
    if (serverAccepts) current = s.value;
    const agree = appSays.ok === serverAccepts && (serverAccepts || APP_HANDLED[r.code] === appSays.reason);
    record(`change password — ${s.label}: app and server agree`, agree, {
      app: appSays.ok ? 'accept' : `refuse (${appSays.reason})`, server: serverAccepts ? 'accept' : `refuse ${r.status} ${r.code}`,
      note: `app ${appSays.ok ? 'accepts' : 'refuses'}, server ${serverAccepts ? 'accepts' : `refuses (${r.status} ${r.code})`}`,
    });
    if (!serverAccepts && r.code && !(r.code in APP_HANDLED)) record(`server code ${r.code} is translated by the app`, false, {});
  }

  const oldLogin = await call('POST', '/api/auth/login', { email, password: pw.registration });
  record('the registration password no longer works after the change', oldLogin.status === 401 || oldLogin.status === 403, { status: oldLogin.status });
  const newLogin = await call('POST', '/api/auth/login', { email, password: current });
  token = tokenOf(newLogin) || token;
  record('the current password works', newLogin.status === 200, { status: newLogin.status });

  const del = await call('DELETE', '/api/auth/account', { password: current, confirmation: 'DELETE' }, token);
  deleted = del.status === 200 && del.data?.deleted === true;
  record('test account deleted', deleted, { status: del.status });
  const gone = await call('POST', '/api/auth/login', { email, password: current });
  record('sign-in fails after deletion', gone.status === 401 || gone.status === 403, { status: gone.status });
} catch (error) {
  record('run completed without errors', false, { note: String(error.message || error) });
} finally {
  if (created && !deleted) {
    try {
      const again = await call('POST', '/api/auth/login', { email, password: current });
      const cleanup = await call('DELETE', '/api/auth/account', { password: current, confirmation: 'DELETE' }, tokenOf(again));
      deleted = cleanup.status === 200;
      console.log(deleted ? 'Cleanup: test account deleted.' : `CLEANUP NEEDED: delete user "${username}" (${email}) in the admin panel.`);
    } catch { console.log(`CLEANUP NEEDED: delete user "${username}" (${email}) in the admin panel.`); }
  }
}

const failed = results.filter((r) => r.result === 'FAIL').length;
const passed = results.filter((r) => r.result === 'PASS').length;
const report = { checked_at: new Date().toISOString(), server: base, app_version: app.version, version_code: app.android.versionCode,
  test_username: username, test_email: email, account_deleted: deleted, passed, failed, results };
const dir = path.join(ROOT, 'qa'); fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `live-password-check-${report.checked_at.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(report, null, 2));
console.log(`\n${failed ? 'FAILED' : 'ALL PASSED'}: ${passed} passed, ${failed} failed. Report: ${path.relative(ROOT, file)}`);
process.exit(failed ? 1 : 0);
