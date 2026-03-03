@echo off
REM CC-ERP 后端启动脚本 (Windows)

echo ====================================
echo   CC-ERP Backend Service
echo ====================================
echo.

REM 检查 Java 版本
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Java，请先安装 Java 17 或更高版本
    pause
    exit /b 1
)

echo [1/3] 检查环境... 完成
echo.

echo [2/3] 编译项目...
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    echo [错误] 编译失败
    pause
    exit /b 1
)
echo [2/3] 编译项目... 完成
echo.

echo [3/3] 启动服务...
echo.
echo 服务地址: http://localhost:8080/api
echo 按 Ctrl+C 停止服务
echo.

java -jar target\cc-erp-backend-1.0.0.jar

pause
