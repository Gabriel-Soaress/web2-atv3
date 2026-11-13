@echo off
chcp 65001 >nul
title Inicializador - PPW II Atividade 3

echo ==================================================
echo   Iniciando Servidores - Controle de Emprestimos
echo ==================================================
echo.

echo [1/2] Iniciando Backend (NestJS - porta 8000)...
start "Backend NestJS (8000)" cmd /k "cd /d "%~dp0ppw_test_server" && npm run start:dev"

echo [2/2] Iniciando Frontend (Next.js - porta 3000)...
start "Frontend Next.js (3000)" cmd /k "cd /d "%~dp0ppw_test_client" && npm run dev"

echo.
echo Servidores iniciados em janelas separadas!
echo  - Backend:  http://localhost:8000/emprestimos
echo  - Frontend: http://localhost:3000/emprestimos
echo.
echo Aguardando 5 segundos para abrir no navegador...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000/emprestimos"
