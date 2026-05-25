@echo off
echo Iniciando Scout Predictor...
cd /d "%~dp0"
start http://localhost:8080
python -m http.server 8080
