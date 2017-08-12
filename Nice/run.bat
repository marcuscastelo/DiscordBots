@echo off
if exist "shutdown" (del shutdown)
:loop
if exist "shutdown" (exit)
call npm run babel
if errorlevel 1 (goto loop)