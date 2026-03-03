@echo off
REM CC-ERP 后端快速启动脚本 (开发模式)

echo ====================================
echo   CC-ERP Backend (Dev Mode)
echo ====================================
echo.

REM 检查 Java 版本
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Java，请先安装 Java 17 或更高版本
    pause
    exit /b 1
)

echo [启动中] 开发模式服务...
echo.
echo 服务地址: http://localhost:8080/api
echo H2控制台: http://localhost:8080/api/h2-console
echo 按 Ctrl+C 停止服务
echo.

call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests

pause
