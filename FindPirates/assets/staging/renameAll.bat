@echo off
setlocal enabledelayedexpansion

set /a count=21

for %%F in (*.png) do (
    ren "%%F" "!count!.png"
    set /a count+=1
)

echo Renaming complete.
