@echo off
setlocal
cd /d "%~dp0"
call npx eas-cli@latest build --platform android --profile production
pause
