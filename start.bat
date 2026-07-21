@echo off
REM Double-click to run the trainer. Keep this window open while you study.
cd /d "%~dp0"
echo.
echo   On THIS computer:   http://localhost:8000/index.html
echo.
echo   On your iPhone/iPad (same Wi-Fi), open Safari and go to:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo      http:/%%a:8000/index.html
echo.
echo   (Then use Share -^> Add to Home Screen for an app icon.)
echo.
start "" http://localhost:8000/index.html
python -m http.server 8000
