@echo off
REM Maven 自动安装和配置脚本

setlocal enabledelayedexpansion

echo ====================================
echo   CC-ERP Maven 自动安装
echo ====================================
echo.

REM 配置
set MAVEN_VERSION=3.9.6
set MAVEN_ZIP=apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_URL=https://downloads.apache.org/maven/maven3/%MAVEN_VERSION%/binaries/%MAVEN_ZIP%
set MAVEN_HOME=%USERPROFILE%\maven-%MAVEN_VERSION%
set MVN_REPO=%USERPROFILE%\.m2\repository

REM 检查是否已安装
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [跳过] Maven 已安装: %MAVEN_HOME%
    goto :setPath
)

echo [1/3] 下载 Maven %MAVEN_VERSION%...
echo.

REM 创建临时目录
set TEMP_DIR=%TEMP%\maven-install
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM 使用 PowerShell 下载
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '!MAVEN_URL!' -OutFile '%TEMP_DIR%\%MAVEN_ZIP%'}"

if not exist "%TEMP_DIR%\%MAVEN_ZIP%" (
    echo [错误] 下载失败
    echo 请手动下载: %MAVEN_URL%
    goto :cleanup
)

echo [2/3] 解压文件...
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%' -Force"

echo [3/3] 配置完成...

:setPath
REM 设置环境变量
set PATH=%MAVEN_HOME%\bin;%PATH%

echo.
echo ====================================
echo   Maven 安装成功
echo ====================================
echo.
echo MAVEN_HOME: %MAVEN_HOME%
echo.

REM 测试安装
"%MAVEN_HOME%\bin\mvn.cmd" -version

:cleanup
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"

echo.
echo 使用方法:
echo   cd cc-erp-backend
echo   "%MAVEN_HOME%\bin\mvn.cmd" clean package
echo.

endlocal
