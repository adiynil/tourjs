# 设置错误时停止执行
$ErrorActionPreference = "Stop"

Write-Host "开始发布流程..." -ForegroundColor Green

# 检查是否登录 npm
try {
    Write-Host "检查 npm 登录状态..." -ForegroundColor Yellow
    $whoami = npm whoami
    Write-Host "当前登录用户: $whoami" -ForegroundColor Green
} catch {
    Write-Host "您尚未登录 npm，请先登录..." -ForegroundColor Red
    npm login
}

# 获取当前版本
$packageJson = Get-Content 'package.json' | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "`n当前版本: $currentVersion" -ForegroundColor Cyan

# 选择版本更新类型
Write-Host "`n请选择版本更新类型:" -ForegroundColor Yellow
Write-Host "1: patch (补丁版本: 0.0.1 -> 0.0.2)" -ForegroundColor White
Write-Host "2: minor (次要版本: 0.0.1 -> 0.1.0)" -ForegroundColor White
Write-Host "3: major (主要版本: 0.0.1 -> 1.0.0)" -ForegroundColor White
Write-Host "4: 手动输入版本号" -ForegroundColor White
Write-Host "5: 保持当前版本" -ForegroundColor White

$versionType = Read-Host "`n请选择 (1-5)"

switch ($versionType) {
    "1" { 
        npm version patch --no-git-tag-version
        Write-Host "版本已更新为补丁版本" -ForegroundColor Green
    }
    "2" { 
        npm version minor --no-git-tag-version
        Write-Host "版本已更新为次要版本" -ForegroundColor Green
    }
    "3" { 
        npm version major --no-git-tag-version
        Write-Host "版本已更新为主要版本" -ForegroundColor Green
    }
    "4" {
        $newVersion = Read-Host "请输入新版本号 (例如: 1.0.0)"
        npm version $newVersion --no-git-tag-version
        Write-Host "版本已更新为 $newVersion" -ForegroundColor Green
    }
    "5" {
        Write-Host "保持当前版本 $currentVersion" -ForegroundColor Yellow
    }
    default {
        Write-Host "无效的选择，退出发布流程" -ForegroundColor Red
        exit 1
    }
}

# 清理和构建
Write-Host "`n清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
}

Write-Host "开始构建项目..." -ForegroundColor Yellow
npm run build

# 确认发布
Write-Host "`n准备发布包..." -ForegroundColor Yellow
Write-Host "包信息:" -ForegroundColor Cyan
npm pack --dry-run

$confirm = Read-Host "`n确认发布? (y/n)"
if ($confirm -eq 'y') {
    Write-Host "开始发布..." -ForegroundColor Green
    npm publish
    
    # 获取更新后的版本
    $packageJson = Get-Content 'package.json' | ConvertFrom-Json
    $newVersion = $packageJson.version
    
    # 创建 Git 标签
    Write-Host "`n是否创建 Git 标签 v$newVersion? (y/n)" -ForegroundColor Yellow
    $tagConfirm = Read-Host
    if ($tagConfirm -eq 'y') {
        git add package.json
        git commit -m "chore: release v$newVersion"
        git tag -a "v$newVersion" -m "Release v$newVersion"
        Write-Host "Git 标签已创建，记得推送到远程仓库:" -ForegroundColor Cyan
        Write-Host "git push && git push --tags" -ForegroundColor White
    }
    
    Write-Host "`n发布完成!" -ForegroundColor Green
} else {
    Write-Host "取消发布." -ForegroundColor Yellow
} 