@echo off
if exist "shutdown" (del shutdown)
:loop
if exist "shutdown" (exit)
call build_run.bat
if errorlevel 1 (goto loop)