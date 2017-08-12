@echo off
if exist "shutdown" (del shutdown)
:loop
if exist "shutdown" (exit)
npm run babel
goto loop