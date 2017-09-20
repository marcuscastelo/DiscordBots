@echo off
if exist "shutdown" (del shutdown)
:loop
if exist "shutdown" (exit)
node index.js
goto loop