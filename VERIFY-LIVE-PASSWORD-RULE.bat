@echo off
setlocal
cd /d "%~dp0"
title AnswerForU - live check of the 8-character password rule
echo.
echo Checks the 8-character password rule of the app against the live server (answerforu.com).
echo It creates ONE test account, runs register / sign-in / change-password checks,
echo then DELETES the test account. Registration sends one verification e-mail.
echo.
set /p AFU_QA_EMAIL=Inbox for the test account (an address you control): 
if "%AFU_QA_EMAIL%"=="" goto end
node scripts\verify-live-password-rule.mjs --email "%AFU_QA_EMAIL%" --yes-create-test-account
echo.
echo The JSON report is in the qa folder.
:end
pause
