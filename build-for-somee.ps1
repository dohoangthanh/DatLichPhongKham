# ========================================
# BUILD SCRIPT CHO SOMEE.COM
# Phòng Khám Đa Khoa
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUILD BACKEND FOR SOMEE.COM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Đường dẫn
$backendPath = "D:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI"
$publishPath = "$backendPath\publish"

# Clean
Write-Host "`n[1/4] Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $publishPath) {
    Remove-Item -Path $publishPath -Recurse -Force
}

Set-Location $backendPath
dotnet clean --configuration Release

# Build
Write-Host "`n[2/4] Building project..." -ForegroundColor Yellow
dotnet build --configuration Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Publish
Write-Host "`n[3/4] Publishing..." -ForegroundColor Yellow
dotnet publish --configuration Release --output $publishPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Publish failed!" -ForegroundColor Red
    exit 1
}

# Tạo web.config
Write-Host "`n[4/4] Creating web.config..." -ForegroundColor Yellow

$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" 
                  arguments=".\QuanLyKhamBenhAPI.dll" 
                  stdoutLogEnabled="true" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
      <httpProtocol>
        <customHeaders>
          <add name="Access-Control-Allow-Origin" value="*" />
          <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
          <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
        </customHeaders>
      </httpProtocol>
    </system.webServer>
  </location>
</configuration>
"@

$webConfig | Out-File -FilePath "$publishPath\web.config" -Encoding UTF8

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ BUILD COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n📂 Files được tạo tại:" -ForegroundColor Cyan
Write-Host "   $publishPath" -ForegroundColor White

Write-Host "`n📋 BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. Mở FileZilla (hoặc WinSCP)" -ForegroundColor White
Write-Host "2. Connect đến FTP Somee:" -ForegroundColor White
Write-Host "   - Host: ftp://yoursite.somee.com" -ForegroundColor Gray
Write-Host "   - Username: yoursite" -ForegroundColor Gray
Write-Host "   - Password: ********" -ForegroundColor Gray
Write-Host "   - Port: 21" -ForegroundColor Gray
Write-Host "3. Upload tất cả files từ:" -ForegroundColor White
Write-Host "   $publishPath" -ForegroundColor Gray
Write-Host "   vào folder /wwwroot/ trên server" -ForegroundColor Gray
Write-Host "4. Test API tại: https://yoursite.somee.com/api" -ForegroundColor White

Write-Host "`n💡 TIP: Để mở FileZilla, chạy:" -ForegroundColor Cyan
Write-Host "   Start-Process 'https://filezilla-project.org/download.php?type=client'" -ForegroundColor Gray

Write-Host "`n"
$openFolder = Read-Host "Bạn có muốn mở folder publish? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process "explorer.exe" -ArgumentList $publishPath
}
