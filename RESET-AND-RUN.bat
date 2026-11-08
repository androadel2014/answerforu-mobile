@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo AnswerForU Mobile v3.3.0 API CONNECTED - fresh start
echo ============================================================
if exist .expo rmdir /s /q .expo
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
call npm install
if errorlevel 1 goto :fail
call npx expo start --clear
exit /b %errorlevel%
:fail
echo.
echo npm install failed. Check internet connection and Node/npm.
pause
exit /b 1
