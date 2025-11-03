@echo off
title 🌾 MGNREGA Dashboard Auto Starter
echo =========================================
echo       MGNREGA Dashboard Auto Starter
echo =========================================
echo.

:: Step 1: Move to server folder (same directory as this .bat)
cd /d "%~dp0"

:: Step 2: Fetch the latest data
echo 📦 Fetching latest MGNREGA data...
node fetch_incremental.js
if %errorlevel% neq 0 (
  echo ❌ Data fetch failed! Check Node setup or internet connection.
  pause
  exit /b
)
echo ✅ Data fetch complete.
echo.

:: Step 3: Start backend server
echo 🚀 Starting API Server (http://localhost:4000)
start cmd /k "cd /d %~dp0 && node index.js"
echo.

:: Step 4: Start frontend React app
echo 💻 Starting Frontend (React)
cd ..\client
start cmd /k "npm start"

echo.
echo ✅ All systems running! Access the app at: http://localhost:3000
pause
