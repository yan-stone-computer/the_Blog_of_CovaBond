@echo off
echo ========================================
echo    高俊杰的个人博客 - 启动脚本
echo ========================================
echo.

echo [1/2] 正在构建博客...
python build.py
if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 正在启动服务器...
echo.
echo ========================================
echo   博客已启动！
echo ========================================
echo.
echo   博客首页: http://localhost:5000
echo   文章管理: http://localhost:5000/admin.html
echo.
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

python server.py
