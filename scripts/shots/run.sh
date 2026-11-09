#!/usr/bin/env bash
# AnswerForU v3.7.0 GATE walk — full-section screenshot capture.
# Runs on the CI host with adb connected to a booted emulator.
# Captures the REAL app UI via screencap, running the production release APK
# against the LIVE backend (https://answerforu.com) as a guest. No account
# is created, nothing is posted or saved server-side. All navigation uses
# the app's own on-screen controls (bottom nav, tiles, buttons) — NO
# hardware back: with predictive back enabled, an injected keyevent 4
# finishes the activity and backgrounds the app.
set -x
PKG="com.answerforu.app"
OUT="screenshots"
mkdir -p "$OUT"

dump_ui() {
  adb shell uiautomator dump /sdcard/dump.xml >/dev/null 2>&1 || true
  adb pull /sdcard/dump.xml /tmp/dump.xml >/dev/null 2>&1 || true
}

tap_text() {
  # $1 = text, $2 = exact|contains (default contains)
  dump_ui
  local coords
  coords=$(python3 scripts/shots/tap_text.py /tmp/dump.xml "$1" "${2:-contains}") || return 1
  adb shell input tap $coords
}

ui_has() {
  dump_ui
  grep -q "$1" /tmp/dump.xml
}

dismiss_anr() {
  if ui_has "isn.t responding"; then
    echo "ANR dialog present; tapping Wait"
    tap_text "Wait" exact || true
    sleep 3
  fi
}

wait_for() {
  # $1 = text anchor, $2 = max seconds
  local t=0
  while [ $t -lt "$2" ]; do
    if ui_has "$1"; then echo "anchor '$1' found after ~${t}s"; return 0; fi
    sleep 3; t=$((t+3))
  done
  echo "TIMEOUT waiting for anchor '$1'"
  return 1
}

tap_with_scroll() {
  # $1 = text, $2 = mode, $3 = max attempts (scrolls between attempts)
  local i=1
  while [ $i -le "$3" ]; do
    if tap_text "$1" "$2"; then echo "tapped '$1' on attempt $i"; return 0; fi
    echo "tap attempt $i for '$1' failed; scrolling"
    adb shell input swipe 540 1400 540 700 300 || true
    sleep 2; i=$((i+1))
  done
  return 1
}

snap() { dismiss_anr; sleep 1; adb exec-out screencap -p > "$OUT/$1"; echo "saved $1"; }

decline_perm() {
  if tap_text "Don’t allow" contains; then echo "permission dialog dismissed"; sleep 1; fi
  if tap_text "Don't allow" contains; then echo "permission dialog dismissed (ascii)"; sleep 1; fi
}

goto_more() { tap_text "More" exact || true; sleep 3; }

adb wait-for-device
adb shell wm size 1080x1920 || true
sleep 2

adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear "$PKG" || true
adb logcat -c || true

# --- Cold start measurement (true first run, data cleared) ---
adb shell am start -W -n "$PKG/.MainActivity" | tee "$OUT/debug-coldstart.txt" || true
echo "pid after am start: $(adb shell pidof "$PKG" || echo NONE)"
if ! adb shell pidof "$PKG" >/dev/null 2>&1; then
  echo "no app process after am start; trying monkey launcher"
  adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || true
  sleep 5
  echo "pid after monkey: $(adb shell pidof "$PKG" || echo NONE)"
fi
sleep 8
dismiss_anr
decline_perm

# --- First-run onboarding (v3.7.0 WelcomeTour, Arabic default) ---
wait_for "تخطي" 90 || sleep 5
snap 00-onboarding-1.png
if tap_text "التالي" exact; then echo "tour next 1"; sleep 3; fi
snap 00-onboarding-2.png
if tap_text "التالي" exact; then echo "tour next 2"; sleep 3; fi
snap 00-onboarding-3.png
if tap_text "ابدأ الاستكشاف" contains; then echo "tour finished via Start exploring"; sleep 4; fi
decline_perm

# --- Home in Arabic (default state) ---
wait_for "الرئيسية" 60 || sleep 3
sleep 3
snap 01-home.png

# Switch to English with the header language chip (cycles ar -> en).
if tap_text "AR" exact; then echo "language chip tapped (ar -> en)"; sleep 4; fi
dismiss_anr
wait_for "Explore sections" 45 || wait_for "Everything you need" 30 || true
sleep 2
snap 02-home-en.png

# --- Journey (bottom tab) ---
tap_text "Journey" exact || true
wait_for "Choose a stage" 60 || true
sleep 2
snap 03-journey.png

# --- Marketplace (bottom tab; community places load from live API) ---
tap_text "Marketplace" exact || true
wait_for "Explore places" 60 || true
sleep 6
adb shell input swipe 540 1400 540 950 300 || true
sleep 4
snap 04-marketplace.png

# --- Learn hub (bottom tab) ---
tap_text "Learn" exact || true
wait_for "Learn life in America" 60 || true
sleep 2
snap 05-learn.png

# --- Citizenship (from Learn hub) ---
tap_with_scroll "U.S. Citizenship" contains 3 || true
wait_for "Choose a study area" 60 || wait_for "CITIZENSHIP GUIDE" 20 || true
sleep 3
snap 06-citizenship.png

# --- Survival English (back via Learn tab) ---
tap_text "Learn" exact || true
sleep 3
tap_with_scroll "Survival English" contains 3 || true
wait_for "EVERYDAY ENGLISH" 60 || wait_for "Choose a situation" 20 || true
sleep 2
snap 07-survival-english.png

# --- Offline packs (back via Learn tab) ---
tap_text "Learn" exact || true
sleep 3
tap_with_scroll "Offline packs" contains 3 || true
sleep 5
snap 08-offline-packs.png

# --- All sections / More tab ---
goto_more
wait_for "DISCOVER ANSWERFORU" 45 || true
sleep 2
snap 09-all-sections.png
adb shell input swipe 540 1400 540 700 300 || true
sleep 2
snap 10-all-sections-scrolled.png

# --- CV Builder (More tile) ---
goto_more
tap_with_scroll "CV Builder" contains 3 || true
wait_for "YOUR NEXT OPPORTUNITY" 45 || true
sleep 3
snap 11-cv-builder.png

# --- Feed (More tile) ---
goto_more
tap_with_scroll "Feed" exact 4 || true
wait_for "CONNECT & SHARE" 45 || true
sleep 5
snap 12-feed.png

# --- Messages (More tile; may gate to auth as guest — capture as-is) ---
goto_more
tap_with_scroll "Messages" exact 4 || true
sleep 6
snap 13-messages.png

# --- My Account / Profile (More tile; as guest may show Auth — capture as-is) ---
goto_more
tap_with_scroll "My Account" contains 4 || true
sleep 6
snap 14-profile-or-auth.png

# --- Notifications (More tile) ---
goto_more
tap_with_scroll "Notifications" exact 4 || true
sleep 5
snap 15-notifications.png

# --- Saved (More tile) ---
goto_more
tap_with_scroll "Saved" exact 4 || true
sleep 5
snap 16-saved.png

# --- My submissions (More tile) ---
goto_more
tap_with_scroll "My submissions" contains 4 || true
sleep 5
snap 17-my-submissions.png

# --- Resources / published library (More tile) ---
goto_more
tap_with_scroll "Complete resources" contains 4 || true
sleep 6
snap 18-resources.png

# --- Recommend (More tile, best effort) ---
goto_more
tap_with_scroll "Recommend" contains 4 || true
wait_for "Recommend a State" 30 || true
sleep 3
snap 19-recommend.png

# --- Glossary (More tile) ---
goto_more
tap_with_scroll "Glossary" contains 4 || true
wait_for "AMERICA LIFE DICTIONARY" 45 || true
sleep 3
snap 20-glossary.png

# --- Jobs shortcut (More tile -> marketplace filtered) ---
goto_more
tap_with_scroll "Jobs" exact 4 || true
sleep 6
snap 21-jobs.png

# --- Housing shortcut (More tile -> marketplace filtered) ---
goto_more
tap_with_scroll "Housing" exact 4 || true
sleep 6
snap 22-housing.png

# --- Admin dashboard (More tile; guest should be gated — capture as-is) ---
goto_more
tap_with_scroll "Admin dashboard" contains 4 || true
sleep 6
snap 23-admin.png

# --- Legal: Privacy tile opens the website (Linking.openURL) — capture the
# browser as direct evidence, LAST step of the walk. ---
goto_more
tap_with_scroll "Privacy" contains 5 || true
sleep 8
snap 24-legal-privacy.png
echo "foreground after Privacy tap:"
adb shell dumpsys activity activities 2>/dev/null | grep -i -m2 "topResumedActivity\|ResumedActivity" || true
# Return to the app via its launcher (no hardware back).
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || true
sleep 6
snap 25-returned-to-app.png

dump_ui
cp /tmp/dump.xml "$OUT/debug-final-dump.xml" || true
adb shell dumpsys activity activities 2>/dev/null | grep -i -A2 -B2 "answerforu" > "$OUT/debug-activities.txt" || true
adb shell pidof "$PKG" > "$OUT/debug-pid.txt" 2>/dev/null || echo "no process" > "$OUT/debug-pid.txt"
adb logcat -d -b crash > "$OUT/logcat-crash.txt" 2>/dev/null || true
adb logcat -d > "$OUT/logcat-full.txt" 2>/dev/null || true
ls -la "$OUT"
