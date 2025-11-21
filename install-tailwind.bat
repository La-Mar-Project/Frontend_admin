@echo off
cd /d "%~dp0"
echo Installing Tailwind CSS, PostCSS, and Autoprefixer...
call npm install -D tailwindcss postcss autoprefixer
echo.
echo Installation complete!
pause

