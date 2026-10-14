@echo off
cd /d "%~dp0"
start "Cosmic Scrap Moderation Server" /min node admin-server.cjs
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4178/admin.html"
