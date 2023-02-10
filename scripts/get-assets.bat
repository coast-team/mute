@ECHO off
REM - Get javascript assets
chcp 65001 > nul

cd ../src/assets

CALL :RecuperationAsset jio-latest.js, https://lab.nexedi.com/nexedi/jio/raw/master/dist/jio-v3.45.0.js?inline=false

CALL :RecuperationAsset rsvp-2.0.4.min.js, https://lab.nexedi.com/nexedi/rsvp.js/raw/master/dist/rsvp-2.0.4.min.js?inline=false 

exit /B 0

:RecuperationAsset
IF Exist %~1 (
    echo "The file %~1 already exist"
) ELSE (
    curl %~2 -o %~1
)
exit /B 0