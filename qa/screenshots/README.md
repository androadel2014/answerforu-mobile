# Required real Android Arabic captures — NOT YET CAPTURED

The source build environment used for this artifact has no Android SDK emulator, `adb`, native Expo/Metro dependencies or installed release APK. It would be misleading to supply drawn mockups as real Android screenshots. **No screenshots are claimed or included.**

Run `qa/CAPTURE-REAL-AR-EMULATOR.bat` with the Arabic app open on a physical device or Android emulator after installing an actual v3.7.0 build. It prompts the tester to open the following screens and saves real PNGs under this folder:

`home-ar.png`, `journey-ar.png`, `marketplace-ar.png`, `citizenship-ar.png`, `survival-ar.png`, `community-ar.png`, `cv-ar.png`, `profile-ar.png`, `auth-ar.png`.

Use an authenticated account for CV and Profile; sign out before Auth; record dimensions and emulator device/version; inspect RTL at narrow width, error/empty states and scrolling; rerun the existing tests on Android before sign-off. Captures must come from the deployed APK, not a generated illustration.
