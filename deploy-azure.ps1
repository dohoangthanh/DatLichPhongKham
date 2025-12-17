# ========================================
# AZURE DEPLOYMENT SCRIPT
# Phòng Khám Đa Khoa
# ========================================

# Cấu hình
$resourceGroup = "PhongKhamRG"
$location = "Southeast Asia"  # Singapore - gần VN nhất
$appServicePlan = "PhongKhamPlan"
$webAppName = "phongkham-api-$(Get-Random -Maximum 9999)"  # Tên phải unique
$sqlServerName = "phongkham-sql-$(Get-Random -Maximum 9999)"
$sqlDatabaseName = "QuanLyKhamBenh"
$sqlAdminUser = "sqladmin"
$sqlAdminPassword = "P@ssw0rd2025!" # ĐỔI PASSWORD NÀY!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AZURE DEPLOYMENT - Phòng Khám Đa Khoa" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kiểm tra Azure CLI
Write-Host "`n[1/8] Checking Azure CLI..." -ForegroundColor Yellow
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI chưa cài. Đang mở trang download..." -ForegroundColor Red
    Start-Process "https://aka.ms/installazurecliwindows"
    Write-Host "Sau khi cài xong, chạy lại script này!" -ForegroundColor Yellow
    exit
}

# Login Azure
Write-Host "`n[2/8] Logging in to Azure..." -ForegroundColor Yellow
az login

# Tạo Resource Group
Write-Host "`n[3/8] Creating Resource Group: $resourceGroup..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location

# Tạo SQL Server
Write-Host "`n[4/8] Creating SQL Server: $sqlServerName..." -ForegroundColor Yellow
Write-Host "    Admin User: $sqlAdminUser" -ForegroundColor Gray
az sql server create `
    --name $sqlServerName `
    --resource-group $resourceGroup `
    --location $location `
    --admin-user $sqlAdminUser `
    --admin-password $sqlAdminPassword

# Mở firewall cho tất cả IP (dev only - production nên giới hạn)
Write-Host "`n[5/8] Configuring SQL Server Firewall..." -ForegroundColor Yellow
az sql server firewall-rule create `
    --resource-group $resourceGroup `
    --server $sqlServerName `
    --name AllowAllIps `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 255.255.255.255

# Tạo SQL Database
Write-Host "`n[6/8] Creating SQL Database: $sqlDatabaseName..." -ForegroundColor Yellow
az sql db create `
    --resource-group $resourceGroup `
    --server $sqlServerName `
    --name $sqlDatabaseName `
    --service-objective Basic `
    --max-size 2GB

# Lấy Connection String
Write-Host "`n[7/8] Getting Connection String..." -ForegroundColor Yellow
$connString = az sql db show-connection-string `
    --client ado.net `
    --server $sqlServerName `
    --name $sqlDatabaseName `
    --output tsv

$connString = $connString.Replace("<username>", $sqlAdminUser)
$connString = $connString.Replace("<password>", $sqlAdminPassword)

# Tạo App Service Plan
Write-Host "`n[8/8] Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --location $location `
    --sku B1 `
    --is-linux

# Tạo Web App
Write-Host "`nCreating Web App: $webAppName..." -ForegroundColor Yellow
az webapp create `
    --name $webAppName `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --runtime "DOTNET|8.0"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ AZURE INFRASTRUCTURE CREATED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n📝 THÔNG TIN QUAN TRỌNG - LƯU LẠI:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Resource Group    : $resourceGroup" -ForegroundColor White
Write-Host "SQL Server        : $sqlServerName.database.windows.net" -ForegroundColor White
Write-Host "SQL Database      : $sqlDatabaseName" -ForegroundColor White
Write-Host "SQL Admin User    : $sqlAdminUser" -ForegroundColor White
Write-Host "SQL Admin Password: $sqlAdminPassword" -ForegroundColor Yellow
Write-Host "Backend URL       : https://$webAppName.azurewebsites.net" -ForegroundColor White
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host $connString -ForegroundColor Gray

# Lưu thông tin vào file
$info = @"
========================================
AZURE DEPLOYMENT INFO
========================================
Resource Group    : $resourceGroup
Location          : $location

SQL Server        : $sqlServerName.database.windows.net
SQL Database      : $sqlDatabaseName
SQL Admin User    : $sqlAdminUser
SQL Admin Password: $sqlAdminPassword

Backend Web App   : $webAppName
Backend URL       : https://$webAppName.azurewebsites.net

Connection String:
$connString

========================================
"@

$info | Out-File -FilePath "azure-deployment-info.txt" -Encoding UTF8

Write-Host "`n✅ Thông tin đã lưu vào: azure-deployment-info.txt" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run migrations to Azure SQL Database" -ForegroundColor White
Write-Host "2. Deploy Backend code to Azure Web App" -ForegroundColor White
Write-Host "3. Deploy Frontend to Azure Static Web Apps" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Cyan
Read-Host
