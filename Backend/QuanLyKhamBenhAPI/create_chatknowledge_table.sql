-- Tạo bảng ChatKnowledge để lưu trữ kiến thức chatbot
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatKnowledge')
BEGIN
    CREATE TABLE ChatKnowledge (
        KnowledgeId INT PRIMARY KEY IDENTITY(1,1),
        Question NVARCHAR(500) NOT NULL,
        Answer NVARCHAR(MAX) NOT NULL,
        Category NVARCHAR(50) NOT NULL DEFAULT 'general',
        UsageCount INT NOT NULL DEFAULT 0,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        LastUsedDate DATETIME NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedBy NVARCHAR(50) NULL
    );

    PRINT 'Bảng ChatKnowledge đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng ChatKnowledge đã tồn tại.';
END
GO

-- Thêm dữ liệu mẫu
INSERT INTO ChatKnowledge (Question, Answer, Category, CreatedDate, IsActive)
VALUES
    (N'Phòng khám của tôi', N'Phòng khám đa khoa của chúng tôi cung cấp dịch vụ khám bệnh chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại. Chúng tôi có 14 bác sĩ chuyên khoa, 8 chuyên khoa khác nhau và hơn 26 dịch vụ khám bệnh.', 'general', GETDATE(), 1),
    
    (N'Giờ làm việc', N'Phòng khám mở cửa:\n• Thứ 2 - Thứ 6: 7:00 - 20:00\n• Thứ 7: 7:00 - 17:00\n• Chủ nhật: 8:00 - 12:00\n\nHotline hỗ trợ 24/7: 1900-xxxx', 'general', GETDATE(), 1),
    
    (N'Cách đặt lịch khám', N'Để đặt lịch khám, bạn làm theo các bước sau:\n1. Đăng nhập vào tài khoản\n2. Vào trang "Đặt lịch khám"\n3. Chọn chuyên khoa phù hợp\n4. Chọn bác sĩ\n5. Chọn ngày và giờ khám\n6. Xác nhận thông tin và đặt lịch\n\nHoặc gọi hotline để được hỗ trợ!', 'appointment', GETDATE(), 1),
    
    (N'Chi phí khám bệnh', N'Chi phí khám bệnh phụ thuộc vào dịch vụ và chuyên khoa:\n• Khám tổng quát: 200,000 - 300,000 VNĐ\n• Khám chuyên khoa: 300,000 - 500,000 VNĐ\n• Xét nghiệm: Tùy loại xét nghiệm\n\nBạn có thể xem chi tiết giá các dịch vụ tại trang "Dịch vụ"', 'service', GETDATE(), 1),
    
    (N'Thanh toán', N'Chúng tôi chấp nhận các phương thức thanh toán:\n• Tiền mặt\n• Chuyển khoản ngân hàng\n• Thẻ ATM/Credit Card\n• Ví điện tử (MoMo, ZaloPay)\n\nBạn có thể thanh toán trực tiếp tại quầy hoặc thanh toán online khi đặt lịch.', 'service', GETDATE(), 1),
    
    (N'Hủy lịch hẹn', N'Để hủy lịch hẹn:\n1. Vào trang "Lịch hẹn của tôi"\n2. Chọn lịch hẹn cần hủy\n3. Nhấn nút "Hủy lịch"\n4. Xác nhận hủy\n\nLưu ý: Nên hủy lịch trước 24h để tránh mất phí.', 'appointment', GETDATE(), 1),
    
    (N'Kết quả xét nghiệm', N'Kết quả xét nghiệm thường có sau 1-3 ngày tùy loại xét nghiệm.\nBạn có thể:\n• Xem online tại trang "Kết quả xét nghiệm"\n• Nhận qua email\n• Nhận trực tiếp tại phòng khám\n\nHệ thống sẽ thông báo khi kết quả sẵn sàng.', 'service', GETDATE(), 1);

PRINT 'Đã thêm ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' câu hỏi mẫu vào ChatKnowledge';
GO

SELECT * FROM ChatKnowledge;
