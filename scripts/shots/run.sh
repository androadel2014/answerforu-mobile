#!/usr/bin/env bash
# One-off Play Store screenshot capture for AnswerForU (com.answerforu.app).
# Runs on the CI host with adb connected to a booted emulator.
# Captures the REAL app UI via screencap, running the production release APK
# against the LIVE backend (https://answerforu.com) as a guest. No account
# is created, nothing is posted or saved. All navigation uses the app's own
# on-screen controls (bottom nav, section buttons, tiles) — deliberately NO
# hardware-back: with predictive back enabled, an injected keyevent 4
# finished the activity in run 2 and backgrounded the app.
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
  # The emulator's System UI watchdog can throw a modal "System UI isn't
  # responding" dialog over the app (run 3 sat behind it for the whole
  # session). Tapping "Wait" is the safe dismissal; check before captures.
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
  # $1 = text, $2 = mode, $3 = max attempts. Scrolls the current screen
  # between attempts for targets that live below the fold (off-screen
  # ScrollView children are absent from the uiautomator hierarchy).
  local i=1
  while [ $i -le "$3" ]; do
    if tap_text "$1" "$2"; then echo "tapped '$1' on attempt $i"; return 0; fi
    echo "tap attempt $i for '$1' failed; scrolling"
    adb shell input swipe 540 1400 540 700 300 || true
    sleep 2; i=$((i+1))
  done
  return 1
}

snap() { dismiss_anr; sleep 1; adb exec-out screencap -p > "$OUT/$1"; }

adb wait-for-device
# Portrait phone resolution for Play screenshots.
adb shell wm size 1080x1920 || true
sleep 2

adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear "$PKG" || true
adb logcat -c || true
adb shell am start -W -n "$PKG/.MainActivity" || true
sleep 5
snap debug-after-start-5s.png
echo "pid after am start: $(adb shell pidof "$PKG" || echo NONE)"
if ! adb shell pidof "$PKG" >/dev/null 2>&1; then
  echo "no app process after am start; trying monkey launcher"
  adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || true
  sleep 5
  echo "pid after monkey: $(adb shell pidof "$PKG" || echo NONE)"
fi
sleep 8
dismiss_anr
snap debug-after-start-13s.png
dismiss_anr

# If a system permission dialog appears (e.g. notifications), decline politely.
if tap_text "Don’t allow" contains; then echo "permission dialog dismissed"; sleep 1; fi
if tap_text "Don't allow" contains; then echo "permission dialog dismissed (ascii)"; sleep 1; fi

# The app starts in Arabic (its default). Switch to English with the header
# language chip (a real in-app control that cycles ar -> en) so the capture
# set is one consistent language.
wait_for "الرئيسية" 60 || sleep 5
dismiss_anr
if tap_text "AR" exact; then echo "language chip tapped (ar -> en)"; sleep 4; fi
dismiss_anr

# 1) Home (guest view, live content).
wait_for "Explore sections" 60 || true
sleep 3
snap 01-home.png

# 2) Journey. (In v3.6.0 the guest Journey currently lands on the app's own
# error boundary — ReferenceError: Btn in JourneyScreen, logcat run 2 — so
# try once, tap the boundary's own Retry once, then capture what is real.)
tap_text "Journey" exact || true
if ! wait_for "Choose a stage" 45; then
  if ui_has "Could not open this section"; then
    echo "journey error boundary shown; tapping its Retry"
    tap_text "Retry" exact || true
    wait_for "Choose a stage" 45 || true
  fi
fi
sleep 2
snap 02-journey.png

# 3) Marketplace (community places load from the live API). Anchor avoids
# the raw "&" (uiautomator XML escapes it as &amp;).
tap_text "Marketplace" exact || true
wait_for "Marketplace" 60 || true
sleep 6
# Gentle scroll so the first place card is fully in frame.
adb shell input swipe 540 1400 540 950 300 || true
sleep 4
snap 03-marketplace.png

# 4) Learn hub -> U.S. Citizenship.
tap_text "Learn" exact || true
sleep 3
tap_with_scroll "U.S. Citizenship" contains 3 || true
wait_for "Your path to U.S. citizenship" 60 || true
sleep 3
snap 04-citizenship.png

# 5) Survival English: return via the Learn bottom-nav tab (no hardware
# back), then the Survival English button (scroll-assisted if needed).
tap_text "Learn" exact || true
sleep 3
tap_with_scroll "Survival English" contains 3 || true
wait_for "Passport, please" 60 || true
sleep 2
snap 05-survival-english.png

# 6) Feed: via the More tab's Feed tile, scroll-assisted; fallback = the
# Marketplace screen's own "Open community feed" button.
tap_text "More" exact || true
sleep 3
if tap_with_scroll "Feed" exact 4; then
  echo "feed opened via More tab"
else
  echo "More/Feed tap failed; trying Marketplace fallback"
  tap_text "Marketplace" exact || true
  sleep 4
  for i in $(seq 1 20); do
    if ui_has "Open community feed"; then break; fi
    adb shell input swipe 540 1500 540 500 300 || true
    sleep 1
  done
  tap_text "Open community feed" contains || true
fi
sleep 8
snap 06-feed.png

dump_ui
cp /tmp/dump.xml "$OUT/debug-final-dump.xml" || true
adb shell dumpsys activity activities 2>/dev/null | grep -i -A2 -B2 "answerforu" > "$OUT/debug-activities.txt" || true
adb shell pidof "$PKG" > "$OUT/debug-pid.txt" 2>/dev/null || echo "no process" > "$OUT/debug-pid.txt"
adb logcat -d -b crash > "$OUT/logcat-crash.txt" 2>/dev/null || true
adb logcat -d > "$OUT/logcat-full.txt" 2>/dev/null || true
ls -la "$OUT"
