#!/usr/bin/env bash
# One-off Play Store screenshot capture for AnswerForU (com.answerforu.app).
# Runs on the CI host with adb connected to a booted emulator.
# Captures the REAL app UI via screencap, running the production release APK
# against the LIVE backend (https://answerforu.com) as a guest. No account
# is created, nothing is posted or saved; every screen is reached with real
# taps on the app's own controls (bottom nav, Learn buttons, More tiles).
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

snap() { adb exec-out screencap -p > "$OUT/$1"; }

adb wait-for-device
# Portrait phone resolution for Play screenshots.
adb shell wm size 1080x1920 || true
sleep 2

adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear "$PKG" || true
adb shell am start -n "$PKG/.MainActivity" || adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
sleep 12

# If a system permission dialog appears (e.g. notifications), decline politely.
if tap_text "Don’t allow" contains; then echo "permission dialog dismissed"; sleep 1; fi
if tap_text "Don't allow" contains; then echo "permission dialog dismissed (ascii)"; sleep 1; fi

# The app starts in Arabic (its default). Wait for the Arabic home tab,
# then switch to English with the header language chip (a real in-app
# control that cycles ar -> en) so the capture set is one consistent language.
wait_for "الرئيسية" 60 || sleep 5
if tap_text "AR" exact; then echo "language chip tapped (ar -> en)"; sleep 4; fi

# 1) Home / journey hub (guest view, live content).
wait_for "Explore sections" 60 || true
sleep 3
snap 01-home.png

# 2) Journey.
tap_text "Journey" exact || true
wait_for "My U.S. Journey" 60 || true
wait_for "Choose a stage" 60 || true
sleep 2
snap 02-journey.png

# 3) Marketplace (community places load from the live API).
tap_text "Marketplace" exact || true
wait_for "Marketplace & Community" 60 || true
sleep 8
snap 03-marketplace.png

# 4) Learn hub -> U.S. Citizenship.
tap_text "Learn" exact || true
sleep 3
tap_text "U.S. Citizenship" contains || true
wait_for "Your path to U.S. citizenship" 60 || true
sleep 3
snap 04-citizenship.png

# Back to Learn -> Survival English.
adb shell input keyevent 4
sleep 3
tap_text "Survival English" contains || true
wait_for "Passport, please" 60 || true
sleep 2
snap 05-survival-english.png

# 6) Feed: via the More tab's Feed tile; fallback = Marketplace bottom button.
adb shell input keyevent 4 || true
sleep 2
tap_text "More" exact || true
sleep 3
if tap_text "Feed" exact; then
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
ls -la "$OUT"
