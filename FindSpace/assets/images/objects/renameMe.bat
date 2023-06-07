@echo off
setlocal enabledelayedexpansion

set i=1
for %%F in (*) do (
    ren "%%F" "!i!.png"
    set /a i+=1
)

endlocal
