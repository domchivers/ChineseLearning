@echo off
setlocal
title Bubu Path Editor
cd /d "%~dp0"
chcp 65001 >nul

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   The path editor needs Node.js, which isn't installed.
  echo   Install the LTS version from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

echo.
echo   Starting the path editor...
node server.js
if errorlevel 1 (
  echo.
  echo   The editor stopped with an error. The message above says why.
  pause
)
endlocal
