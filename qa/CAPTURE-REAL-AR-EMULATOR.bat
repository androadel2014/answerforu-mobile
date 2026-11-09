@echo off
setlocal EnableExtensions
where adb >nul 2>&1
if errorlevel 1 (
 echo ERROR: adb is not installed or not on PATH.
 exit /b 1
)
adb get-state >nul 2>&1
if errorlevel 1 (
 echo ERROR: Start the Android emulator or connect a test device first.
 exit /b 1
)
if not exist qa\screenshots mkdir qa\screenshots
call :capture home
call :capture journey
call :capture marketplace
call :capture citizenship
call :capture survival
call :capture community
call :capture cv
call :capture profile
call :capture auth
echo Screenshots captured in qa\screenshots\ .
exit /b 0
:capture
echo.
echo Open the %1 screen on the RUNNING Android app in ARABIC.
echo Confirm content is fully loaded and no keyboard/modal obscures it.
pause
adb shell screencap -p /sdcard/afu_%1.png
if errorlevel 1 exit /b 1
adb pull /sdcard/afu_%1.png qa\screenshots\%1-ar.png
if errorlevel 1 exit /b 1
exit /b 0
