# PowerShell 이미지 다운로드 스크립트
$assetsDir = "public\assets"

# assets 디렉토리 생성
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force
}

# 이미지 URL과 파일명 매핑
$images = @(
    @{ url = "https://www.figma.com/api/mcp/asset/4195e5a4-7bf6-4830-997b-8cd7a24c82f9"; filename = "jjubul-white-2x.png" },
    @{ url = "https://www.figma.com/api/mcp/asset/70fd5eb1-bbfe-4737-ac63-67b73ba02177"; filename = "line-3.svg" },
    @{ url = "https://www.figma.com/api/mcp/asset/2a52a5fc-20d6-4d40-9748-dddd4888ea6d"; filename = "checkbox-checked.svg" },
    @{ url = "https://www.figma.com/api/mcp/asset/e0f04408-121a-4eae-8d25-7f63ac5d9726"; filename = "checkbox-unchecked.svg" },
    @{ url = "https://www.figma.com/api/mcp/asset/ed4e520d-328e-4b56-a9da-bea4d7798f02"; filename = "line-4.svg" },
    @{ url = "https://www.figma.com/api/mcp/asset/eec21001-a87c-4ea0-a1cd-80aaf0318ed6"; filename = "anchor-icon.svg" },
    @{ url = "https://www.figma.com/api/mcp/asset/f6aba9ec-9594-4f3c-b558-b81cd417f41e"; filename = "file-icon.svg" }
)

Write-Host "이미지 다운로드 시작...`n" -ForegroundColor Green

foreach ($image in $images) {
    $filepath = Join-Path $assetsDir $image.filename
    try {
        Write-Host "다운로드 중: $($image.filename)..." -NoNewline
        Invoke-WebRequest -Uri $image.url -OutFile $filepath -ErrorAction Stop
        Write-Host " 완료" -ForegroundColor Green
    } catch {
        Write-Host " 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n다운로드 완료!" -ForegroundColor Green
Write-Host "이미지가 $assetsDir 폴더에 저장되었습니다." -ForegroundColor Cyan
