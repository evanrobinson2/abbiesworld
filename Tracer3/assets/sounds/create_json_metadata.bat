@echo off
setlocal enabledelayedexpansion

set JSON_FILE=sounds.json
set SOUND_FOLDER=%CD%
set OUTPUT_FILE=%SOUND_FOLDER%\%JSON_FILE%

echo { > %OUTPUT_FILE%
set isFirst=true

for %%F in (*.wav) do (
  if !isFirst! == false (
    echo , >> %OUTPUT_FILE%
  )
  echo   "%%~nF": "%%F" >> %OUTPUT_FILE%
  set isFirst=false
)

echo } >> %OUTPUT_FILE%
