#!/usr/bin/env bash
# AnswerForU v3.7.0 GATE walk — part 3: remaining All-sections targets.
# Walk 2 was defeated by a Pixel Launcher ANR dialog whose window hijacked
# every uiautomator dump (the app itself was healthy — screencaps showed
# the onboarding tour throughout). This version self-heals inside dump_ui:
# any dump containing an "isn't responding" dialog taps "Wait" and
# re-dumps before the caller proceeds. Same rules as before: production
# release APK, LIVE backend, guest only, no account, on-screen controls
# only (NO hardware back); auth exit via "Browse without an account".
set -x
PKG="com.answerforu.app"
OUT="screenshots"
mkdir -p "$OUT"

dump_raw() {
  adb shell uiautomator dump /sdcard/dump.xml >/dev/null 2>&1 || true
  adb pull /sdcard/dump.xml /tmp/dump.xml >/dev/null 2>&1 || true
}

coords_for() {
  python3 scripts/shots/tap_text.py /tmp/dump.xml "$1" "${2:-contains}"
}

dump_ui() {
  local i=1
  while [ $i -le 4 ]; do
    dump_raw
    if grep -q "isn.t responding" /tmp/dump.xml 2>/dev/null; then
      echo "ANR dialog in dump (try $i); tapping Wait"
      local c
      c=$(coords_for "Wait" exact) && adb shell input tap $c
      sleep 3; i=$((i+1)); continue
    fi
    return 0
  done
}

tap_text() {
  dump_ui
  local coords
  coords=$(coords_for "$1" "${2:-contains}") || return 1
  adb shell input tap $coords
}

ui_has() {
  dump_ui
  grep -q "$1" /tmp/dump.xml
}

wait_for() {
  local t=0
  while [ $t -lt "$2" ]; do
    if ui_has "$1"; then echo "anchor '$1' found after ~${t}s"; return 0; fi
    sleep 3; t=$((t+3))
  done
  echo "TIMEOUT waiting for anchor '$1'"
  return 1
}

tap_with_scroll() {
  local i=1
  while [ $i -le "$3" ]; do
    if tap_text "$1" "$2"; then echo "tapped '$1' on attempt $i"; return 0; fi
    echo "tap attempt $i for '$1' failed; scrolling"
    adb shell input swipe 540 1400 540 750 300 || true
    sleep 2; i=$((i+1))
  done
  return 1
}

snap() { dump_ui; sleep 1; adb exec-out screencap -p > "$OUT/$1"; echo "saved $1"; }

scroll_top() {
  local i=1
  while [ $i -le 5 ]; do adb shell input swipe 540 500 540 1500 250 || true; sleep 1; i=$((i+1)); done
}

recover_guest() {
  if ui_has "Browse without an account"; then
    echo "on auth screen; exiting via Browse without an account"
    tap_text "Browse without an account" contains || true
    sleep 5
  fi
}

goto_more() {
  recover_guest
  tap_text "More" exact || true
  sleep 3
}

visit() {
  # $1 = tile text, $2 = mode, $3 = anchor (may be empty), $4 = outfile
  goto_more
  scroll_top
  if tap_with_scroll "$1" "$2" 9; then
    if [ -n "$3" ]; then wait_for "$3" 40 || true; fi
    sleep 4
  else
    echo "TILE NOT FOUND: $1"
    sleep 2
  fi
  snap "$4"
  recover_guest
}

adb wait-for-device
adb shell wm size 1080x1920 || true
sleep 2

adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear "$PKG" || true
adb logcat -c || true

adb shell am start -W -n "$PKG/.MainActivity" | tee "$OUT/debug-coldstart.txt" || true
sleep 10
if tap_text "Don’t allow" contains; then echo "permission dialog dismissed"; sleep 1; fi

# Full tour this time (tap Next through all slides, then Start exploring).
wait_for "تخطي" 120 || sleep 5
if tap_text "التالي" exact; then echo "tour next 1"; sleep 3; fi
if tap_text "التالي" exact; then echo "tour next 2"; sleep 3; fi
if tap_text "ابدأ الاستكشاف" contains; then echo "tour finished"; sleep 4; fi
wait_for "الرئيسية" 60 || sleep 3
if tap_text "AR" exact; then echo "language chip tapped (ar -> en)"; sleep 5; fi
wait_for "Everything you need" 45 || true

# --- Grid targets in tile order ---
visit "U.S. Glossary" contains "AMERICA LIFE DICTIONARY" 30-glossary.png
visit "Recommend Me" contains "Recommend a State" 31-recommend.png
visit "Complete resources" contains "" 32-resources.png
visit "Services" exact "" 33-services.png
visit "Products" exact "" 34-products.png
visit "Housing" exact "" 35-housing.png
visit "Jobs" exact "" 36-jobs.png
visit "Feed" exact "CONNECT & SHARE" 37-feed.png
visit "My submissions" contains "" 38-my-submissions.png
visit "Messages" exact "No messages yet" 39-messages.png
visit "CV Builder" contains "YOUR NEXT OPPORTUNITY" 40-cv-builder.png
visit "Notifications" contains_last "" 41-notifications.png
visit "Saved" exact "" 42-saved.png
visit "Verification" exact "" 43-verification.png

# --- Legal tiles open the website in the browser: direct evidence ---
goto_more
scroll_top
if tap_with_scroll "About" exact_last 9; then echo "About tile tapped"; fi
sleep 8
echo "foreground after About tap:"
adb shell dumpsys activity activities 2>/dev/null | grep -i -m2 "topResumedActivity\|ResumedActivity" || true
snap 44-legal-about.png
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || true
sleep 6
recover_guest
goto_more
scroll_top
if tap_with_scroll "Privacy policy" contains_last 9; then echo "Privacy tile tapped"; fi
sleep 8
echo "foreground after Privacy tap:"
adb shell dumpsys activity activities 2>/dev/null | grep -i -m2 "topResumedActivity\|ResumedActivity" || true
snap 45-legal-privacy.png
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || true
sleep 6
recover_guest
snap 46-final-screen.png

dump_ui
cp /tmp/dump.xml "$OUT/debug-final-dump.xml" || true
adb shell pidof "$PKG" > "$OUT/debug-pid.txt" 2>/dev/null || echo "no process" > "$OUT/debug-pid.txt"
adb logcat -d -b crash > "$OUT/logcat-crash.txt" 2>/dev/null || true
adb logcat -d > "$OUT/logcat-full.txt" 2>/dev/null || true
ls -la "$OUT"
