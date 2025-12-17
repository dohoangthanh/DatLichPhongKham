# ========================================
# UPLOAD TO SOMEE VIA FTP (PowerShell)
# ========================================

$ftpServer = "ftp://155.254.244.30"
$ftpUsername = "dohoangthanh"
$ftpPassword = Read-Host "Nhập password Somee Control Panel" -AsSecureString
$ftpPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPassword))

$localFolder = "D:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI\publish"
$remoteFolder = "/www.PhongKhamDaKhoa.somee.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UPLOAD FILES TO SOMEE VIA FTP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to upload file
function Upload-File {
    param(
        [string]$LocalFile,
        [string]$RemotePath
    )
    
    try {
        $fileName = Split-Path $LocalFile -Leaf
        $uri = "$ftpServer$RemotePath/$fileName"
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPasswordPlain)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($LocalFile)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        Write-Host "  ✅ $fileName" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ $fileName - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to create directory
function Create-FtpDirectory {
    param([string]$RemotePath)
    
    try {
        $uri = "$ftpServer$RemotePath"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPasswordPlain)
        $response = $ftpRequest.GetResponse()
        $response.Close()
    }
    catch {
        # Ignore if directory exists
    }
}

# Get all files
$files = Get-ChildItem -Path $localFolder -Recurse -File

Write-Host "`nTổng số files: $($files.Count)" -ForegroundColor Yellow
Write-Host "Bắt đầu upload...`n" -ForegroundColor Yellow

$uploaded = 0
$failed = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($localFolder.Length).Replace("\", "/")
    $remoteFilePath = $remoteFolder + $relativePath
    $remoteDir = Split-Path $remoteFilePath -Parent
    
    # Create directory if needed
    if ($remoteDir -ne $remoteFolder) {
        Create-FtpDirectory -RemotePath $remoteDir
    }
    
    # Upload file
    Upload-File -LocalFile $file.FullName -RemotePath $remoteDir
    $uploaded++
    
    # Progress
    if ($uploaded % 10 -eq 0) {
        Write-Host "`n[$uploaded/$($files.Count)] files uploaded...`n" -ForegroundColor Cyan
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ UPLOAD COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Uploaded: $uploaded files" -ForegroundColor White
Write-Host "Failed: $failed files" -ForegroundColor White
Write-Host "`nBây giờ hãy RESTART website trong Control Panel!" -ForegroundColor Yellow
