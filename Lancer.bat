@echo off
cd /d "%~dp0"

start "Proxy Anthropic" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "Vite Dev" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
