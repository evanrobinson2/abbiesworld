@echo off
setlocal enabledelayedexpansion
set i=1
for %%a in (*.png) do (
    ren "%%a" "!i!.png"
    set /a i=!i!+1
)
