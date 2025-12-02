# Script để chuyển Question.txt thành SQL INSERT statements
param(
    [string]$InputFile = "Question.txt",
    [string]$OutputFile = "import_questions.sql"
)

# Đọc file
$questions = Get-Content $InputFile -Encoding UTF8 | Where-Object { $_.Trim() -ne "" }

# Nhóm câu hỏi theo category
$categories = @{
    "booking" = @("đặt lịch", "huỷ lịch", "hủy lịch", "đổi giờ", "đặt lại", "tái khám")
    "doctor" = @("bác sĩ", "bác si", "bs.", "giỏi", "kinh nghiệm")
    "specialty" = @("chuyên khoa", "khoa", "nội", "ngoại", "nhi", "sản", "tai mũi họng", "da liễu")
    "service" = @("dịch vụ", "xét nghiệm", "siêu âm", "x-quang", "chụp", "tiêm", "test")
    "working_hours" = @("giờ làm", "mở cửa", "chủ nhật", "ngày lễ", "ngoài giờ", "ca đêm")
    "account" = @("đăng nhập", "đăng ký", "tài khoản", "mật khẩu", "quên", "khóa")
    "payment" = @("thanh toán", "phí", "giá", "hóa đơn", "hoàn tiền", "momo", "zalopay")
    "record" = @("hồ sơ", "bệnh án", "kết quả", "xét nghiệm", "chẩn đoán")
    "location" = @("ở đâu", "địa chỉ", "gửi xe", "đường đi")
    "other" = @()
}

# Function để phân loại câu hỏi
function Get-Category {
    param($question)
    
    $lowerQ = $question.ToLower()
    
    foreach ($cat in $categories.Keys) {
        foreach ($keyword in $categories[$cat]) {
            if ($lowerQ -contains $keyword) {
                return $cat
            }
        }
    }
    return "other"
}

# Template câu trả lời cho từng category
$answerTemplates = @{
    "booking" = "Để đặt lịch khám, vui lòng:`n1. Đăng nhập vào hệ thống`n2. Chọn 'Đặt Lịch Khám'`n3. Chọn chuyên khoa và bác sĩ`n4. Chọn ngày giờ phù hợp`n5. Xác nhận đặt lịch`n`nHoặc gọi Hotline: 1900-565656"
    "doctor" = "Phòng khám có đội ngũ bác sĩ giàu kinh nghiệm. Bạn có thể xem danh sách bác sĩ và đặt lịch tại trang 'Đặt Lịch Khám' hoặc gọi Hotline: 1900-565656"
    "specialty" = "Phòng khám có đầy đủ các chuyên khoa. Bạn có thể xem chi tiết tại mục 'Chuyên Khoa' hoặc liên hệ Hotline: 1900-565656 để được tư vấn."
    "service" = "Phòng khám cung cấp đa dạng dịch vụ y tế. Bạn có thể xem bảng giá chi tiết tại mục 'Dịch Vụ' hoặc liên hệ: 1900-565656"
    "working_hours" = "Giờ làm việc:`nThứ 2 - Thứ 6: 8:00 - 17:00`nThứ 7: 8:00 - 12:00`nChủ nhật: Nghỉ`n`nHotline: 1900-565656 (24/7)"
    "account" = "Bạn có thể đăng ký/đăng nhập tài khoản tại trang web. Nếu quên mật khẩu, vui lòng chọn 'Quên mật khẩu' hoặc liên hệ Hotline: 1900-565656"
    "payment" = "Phòng khám hỗ trợ thanh toán:`n- Tiền mặt`n- Chuyển khoản`n- Thẻ ATM/Credit`n- Ví điện tử (Momo, ZaloPay)`n`nLiên hệ: 1900-565656"
    "record" = "Bạn có thể xem hồ sơ bệnh án và kết quả xét nghiệm trong mục 'Hồ Sơ Của Tôi' sau khi đăng nhập. Liên hệ: 1900-565656 nếu cần hỗ trợ."
    "location" = "Địa chỉ: 42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội`nCó chỗ gửi xe miễn phí`nHotline: 1900-565656"
    "other" = "Cảm ơn bạn đã liên hệ. Vui lòng gọi Hotline: 1900-565656 để được hỗ trợ chi tiết."
}

# Tạo SQL
$sql = @"
-- Import câu hỏi từ Question.txt
USE QuanLyKhamBenh;
GO

-- Xóa câu hỏi cũ được import tự động
DELETE FROM ChatKnowledges WHERE CreatedBy = N'AutoImport';
GO

"@

$count = 0
foreach ($question in $questions) {
    if ($question.Trim().Length -lt 5) { continue }
    
    $cat = Get-Category $question
    $answer = $answerTemplates[$cat]
    
    $count++
    
    # Escape single quotes
    $q = $question.Replace("'", "''")
    $a = $answer.Replace("'", "''")
    
    $sql += @"
-- Câu hỏi $count
INSERT INTO ChatKnowledges (Question, Answer, Category, UsageCount, CreatedDate, IsActive, CreatedBy)
VALUES (N'$q', N'$a', N'$cat', 0, GETDATE(), 1, N'AutoImport');

"@
}

$sql += @"

GO

-- Thống kê
SELECT Category, COUNT(*) as QuestionCount 
FROM ChatKnowledges 
WHERE CreatedBy = N'AutoImport'
GROUP BY Category
ORDER BY QuestionCount DESC;

SELECT TOP 10 Question, Category 
FROM ChatKnowledges 
WHERE CreatedBy = N'AutoImport';
"@

# Lưu file
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot $OutputFile), $sql, [System.Text.Encoding]::UTF8)

Write-Host "✅ Đã tạo file $OutputFile với $count câu hỏi!" -ForegroundColor Green
Write-Host "Chạy lệnh sau để import vào database:" -ForegroundColor Yellow
Write-Host "sqlcmd -S `"(localdb)\MSSQLLocalDB`" -d QuanLyKhamBenh -i `"$OutputFile`"" -ForegroundColor Cyan
