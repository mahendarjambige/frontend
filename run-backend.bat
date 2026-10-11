@echo off
title Online Survey ^& Polling System - Backend
echo ===================================================================
echo   Online Survey ^& Polling System - Spring Boot Backend
echo ===================================================================
echo.
cd /d "%~dp0backend"

echo Default profile is set to H2 (in-memory SQL, zero configuration needed).
echo To run with your local MySQL database, edit application.properties or run:
echo   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
echo.
echo Starting Spring Boot on http://localhost:8080 ...
echo H2 Console available at: http://localhost:8080/h2-console
echo.
mvn spring-boot:run
pause
