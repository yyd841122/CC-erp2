@echo off
REM Maven Wrapper 初始化脚本

echo ====================================
echo   Maven Wrapper 初始化
echo ====================================
echo.

set WRAPPER_DIR=.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

if not exist "%WRAPPER_JAR%" (
    echo [下载] Maven Wrapper JAR...
    echo.

    REM 创建目录
    if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"

    REM 使用 PowerShell 下载
    powershell -Command "& {Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'}"

    if exist "%WRAPPER_JAR%" (
        echo [成功] Maven Wrapper JAR 下载完成
    ) else (
        echo [错误] 下载失败，请手动下载:
        echo   %WRAPPER_URL%
        echo   放到: %WRAPPER_JAR%
        exit /b 1
    )
) else (
    echo [跳过] Maven Wrapper JAR 已存在
)

echo.
echo ====================================
echo   初始化完成
echo ====================================
echo.
echo 运行 'mvnw.cmd -version' 测试安装
echo.
