TITLE exclude
(for /f "usebackq tokens=2 delims=," %%a in (`tasklist /NH /v /fo csv /FI "IMAGENAME eq cmd.exe" /FI "STATUS eq running" ^| FIND /I "exclude"`) do (
    TASKKILL /F /FI "PID ne %%~a" /FI "IMAGENAME eq cmd.exe" /IM cmd.exe
  )
)
TYPE _output-taskill.txt
taskkill /f /im node.exe