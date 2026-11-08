@echo off
setlocal
cd /d "%~dp0"
echo === Expo Doctor ===
call npx expo-doctor
if errorlevel 1 goto :fail
echo === Android JS Bundle Validation ===
call npx expo export --platform android --output-dir dist-android --clear
if errorlevel 1 goto :fail
echo.
echo PASS - Android bundle generated successfully.
pause
exit /b 0
:fail
echo.
echo FAIL - fix the error above before testing on phone.
pause
exit /b 1
