@echo off
REM One-click dev launcher for DawaLens.
REM   1. Sets up adb reverse so the connected phone can reach Metro and the backend
REM   2. Starts Metro in dev-client + offline mode
REM
REM Usage: double-click this file, or run `dev.bat` from this folder.

setlocal

REM Resolve adb. Prefer the one on PATH, fall back to the default Android SDK location.
where adb >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "ADB=adb"
) else (
    set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
)

if not exist "%ADB%" (
    if "%ADB%"=="adb" (
        echo [dev.bat] adb not found on PATH and not at the default SDK location.
    ) else (
        echo [dev.bat] adb not found at %ADB%.
    )
    echo Install Android Platform Tools or add adb to your PATH, then re-run.
    pause
    exit /b 1
)

echo [dev.bat] Using adb: %ADB%

"%ADB%" devices
echo.

echo [dev.bat] Forwarding tcp:8081 (Metro) and tcp:3000 (backend)...
"%ADB%" reverse tcp:8081 tcp:8081
"%ADB%" reverse tcp:3000 tcp:3000
echo.

echo [dev.bat] Active reverse rules:
"%ADB%" reverse --list
echo.

echo [dev.bat] Starting Metro (dev-client, offline)...
call npx expo start --dev-client --offline

endlocal
