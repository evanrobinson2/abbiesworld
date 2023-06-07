@echo off
setlocal enabledelayedexpansion

set i=0
for %%f in (*.png) do (
    ren "%%f" "!i!.png"
    set /a i=!i!+1
)

endlocal
