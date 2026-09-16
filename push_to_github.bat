@echo off
cd /d "c:\Users\itdlocadm\Desktop\HH\Test"

echo ==============================================
echo   DANG PUSH CODE LEN GITHUB
echo ==============================================

echo [1/5] Khoi tao git...
git init

echo [2/5] Dat ten nhanh main...
git branch -M main

echo [3/5] Cau hinh remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/nhhieu193/vnta.git

echo [4/5] Them tat ca cac file...
git add .
git commit -m "feat: deploy source code"

echo [5/5] Day code len GitHub...
git push -u origin main

echo.
echo ==============================================
echo   HOAN TAT!
echo ==============================================
pause
