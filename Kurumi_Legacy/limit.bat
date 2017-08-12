@echo off
if exist limit (goto l)
copy nul > limit
exit
:l
del limit