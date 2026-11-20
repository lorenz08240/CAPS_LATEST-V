@echo off
echo ====================================================
echo BuildLab ^& WhiteHats Utilities - Home PC Setup
echo ====================================================

REM 1. Set up D:\Capstone Project\WhiteHats Utilities
set "UTILS_TARGET=D:\Capstone Project\WhiteHats Utilities"
if not exist "%UTILS_TARGET%" (
    echo [*] Creating "%UTILS_TARGET%"...
    mkdir "%UTILS_TARGET%"
    echo [*] Copying WhiteHats Utilities tools...
    xcopy /E /I /Y "%~dp0WhiteHats-Utilities\*" "%UTILS_TARGET%\"
    echo [+] WhiteHats Utilities successfully restored at "%UTILS_TARGET%"
) else (
    echo [i] "%UTILS_TARGET%" already exists.
)

REM 2. Place workspace.code-workspace in D:\Capstone Project\BuildLab
set "WS_TARGET=D:\Capstone Project\BuildLab\workspace.code-workspace"
if not exist "%WS_TARGET%" (
    echo [*] Copying workspace.code-workspace to D:\Capstone Project\BuildLab\...
    if not exist "D:\Capstone Project\BuildLab" mkdir "D:\Capstone Project\BuildLab"
    copy /Y "%~dp0workspace.code-workspace" "%WS_TARGET%"
    echo [+] Workspace configuration restored!
)

REM 3. Import MySQL Database if XAMPP is present
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo [*] Detected XAMPP MySQL. Importing buildlab_db.sql...
    "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS buildlab_db;"
    "C:\xampp\mysql\bin\mysql.exe" -u root buildlab_db < "%~dp0..\buildlab_db.sql"
    echo [+] Database buildlab_db imported successfully!
) else (
    echo [!] XAMPP MySQL not detected at C:\xampp\mysql\bin\mysql.exe.
    echo     Please import buildlab_db.sql manually once MySQL is installed.
)

echo.
echo [+] All setup completed! You can open D:\Capstone Project\BuildLab\workspace.code-workspace in VS Code or Antigravity.
pause
