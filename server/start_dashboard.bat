@echo off
title MGNREGA Dashboard Auto Starter
echo ======================================
echo   🌾 Starting MGNREGA Dashboard System
echo ======================================
echo.

:: Step 1: Navigate to server folder
cd /d "%~dp0"

:: Step 2: Run data fetcher first
echo 📦 Fetching latest MGNREGA data...
node fetch_incremental.js
echo ✅ Data fetch complete.
echo.

:: Step 3: Start the server
echo 🚀 Starting API Server at http://localhost:4000
start cmd /k "node index.js"
echo.

:: Step 4: Start the frontend React app
echo 💻 Starting Frontend (React)
cd ..
cd client
start cmd /k "npm start"

echo.
echo ✅ All systems running! You can close this window.
pause
