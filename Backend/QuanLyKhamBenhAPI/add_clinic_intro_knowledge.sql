-- Thêm dữ liệu mẫu cho chatbot - Admin có thể sửa qua trang /admin/chatbot
USE QuanLyKhamBenh;
GO

-- Xóa dữ liệu cũ nếu có
DELETE FROM ChatKnowledges WHERE CreatedBy = N'System';
GO

-- 1. Giới thiệu phòng khám
INSERT INTO ChatKnowledges (Question, Answer, Category, UsageCount, CreatedDate, IsActive, CreatedBy)
VALUES 
(
    N'Giới thiệu về phòng khám', 
    N'GIỚI THIỆU VỀ PHÒNG KHÁM

Địa chỉ: 42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội

Về chúng tôi:
Phòng khám của chúng tôi tự hào là địa chỉ y tế tin cậy với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại và dịch vụ chăm sóc sức khỏe toàn diện.

Sứ mệnh:
Mang đến dịch vụ y tế chất lượng cao, chăm sóc tận tâm và tạo trải nghiệm tốt nhất cho bệnh nhân.

Cam kết:
- Đội ngũ bác sĩ chuyên môn cao
- Trang thiết bị y tế hiện đại
- Quy trình khám chữa bệnh chuyên nghiệp
- Giá cả minh bạch, hợp lý
- Hỗ trợ khách hàng 24/7

Liên hệ: Hotline 1900-565656
Website: medlatec.vn

Bạn có muốn biết thêm về dịch vụ hoặc đặt lịch khám không?', 
    N'about', 
    0, 
    GETDATE(), 
    1, 
    N'System'
);

-- 2. Địa chỉ phòng khám
(
    N'Phòng khám ở đâu?', 
    N'Địa chỉ phòng khám:
42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội

Cách đến:
- Đi xe bus: Tuyến 03, 14, 25 đều đi qua
- Đi xe máy/ô tô: Gần ngã tư Phạm Đình Hổ - Trần Khát Chân

Hotline: 1900-565656 nếu bạn cần hỗ trợ chỉ đường!', 
    N'location', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 3. Giờ làm việc
(
    N'Giờ làm việc của phòng khám', 
    N'Giờ làm việc:

Thứ 2 - Thứ 6: 8:00 - 17:00
Thứ 7: 8:00 - 12:00
Chủ nhật: Nghỉ

Hotline: 1900-565656 (24/7)', 
    N'working_hours', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 4. Cách đặt lịch khám
(
    N'Làm thế nào để đặt lịch khám?', 
    N'Để đặt lịch khám:

1. Vào trang Đặt Lịch Khám
2. Chọn chuyên khoa phù hợp
3. Chọn bác sĩ
4. Chọn ngày và giờ khám
5. Xác nhận thông tin

Hoặc gọi hotline 1900-565656 để được hỗ trợ!', 
    N'booking', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 5. Hủy lịch khám
(
    N'Làm thế nào để hủy lịch khám?', 
    N'Để hủy lịch khám:

1. Vào mục Lịch hẹn của tôi
2. Tìm lịch hẹn cần hủy
3. Nhấn nút Hủy lịch
4. Xác nhận hủy

Lưu ý: Nên hủy trước ít nhất 24 giờ để tránh bị tính phí.

Hotline: 1900-565656', 
    N'booking', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 6. Chi phí khám
(
    N'Chi phí khám bệnh bao nhiêu?', 
    N'Chi phí khám bệnh tùy thuộc vào dịch vụ:

- Khám nội khoa tổng quát: 150.000 VNĐ
- Khám chuyên khoa: 200.000 - 300.000 VNĐ
- Xét nghiệm: Từ 50.000 VNĐ
- Siêu âm: Từ 100.000 VNĐ

Bạn có thể hỏi chi tiết về dịch vụ cụ thể để biết giá chính xác.', 
    N'pricing', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 7. Thanh toán
(
    N'Có thể thanh toán như thế nào?', 
    N'Phương thức thanh toán:

- Tiền mặt tại phòng khám
- Chuyển khoản ngân hàng
- Quét mã QR
- Thẻ ATM/Credit Card

Tất cả đều được hỗ trợ!', 
    N'payment', 
    0, 
    GETDATE(), 
    1, 
    N'System'
),

-- 8. Xem kết quả xét nghiệm
(
    N'Làm thế nào để xem kết quả xét nghiệm?', 
    N'Để xem kết quả xét nghiệm:

1. Đăng nhập vào tài khoản
2. Vào mục Kết quả xét nghiệm
3. Chọn lần khám cần xem
4. Tải về hoặc xem trực tuyến

Kết quả thường có sau 1-3 ngày làm việc.', 
    N'results', 
    0, 
    GETDATE(), 
    1, 
    N'System'
);

GO

-- Kiểm tra dữ liệu vừa thêm
SELECT KnowledgeId, Question, Category, IsActive, CreatedBy, CreatedDate 
FROM ChatKnowledges 
WHERE CreatedBy = N'System'
ORDER BY CreatedDate DESC;
