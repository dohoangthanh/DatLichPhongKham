-- Import tất cả câu hỏi từ Question.txt với câu trả lời chi tiết
USE QuanLyKhamBenh;
GO

-- Xóa dữ liệu cũ
DELETE FROM ChatKnowledges WHERE CreatedBy = N'Import';
GO

-- ===== NHÓM 1: ĐẶT LỊCH KHÁM =====

INSERT INTO ChatKnowledges (Question, Answer, Category, UsageCount, CreatedDate, IsActive, CreatedBy) VALUES
(N'Làm sao để đặt lịch khám?', N'Để đặt lịch khám:
1. Đăng nhập vào tài khoản
2. Vào trang Đặt Lịch Khám
3. Chọn chuyên khoa phù hợp
4. Chọn bác sĩ
5. Chọn ngày và giờ khám
6. Xác nhận đặt lịch

Hoặc gọi Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn đặt lịch khám thì làm thế nào?', N'Bạn có thể đặt lịch online qua website hoặc gọi Hotline: 1900-565656. Trên web: Đăng nhập > Đặt Lịch Khám > Chọn chuyên khoa > Chọn bác sĩ > Chọn giờ > Xác nhận.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch khám online có mất phí không?', N'Đặt lịch online hoàn toàn MIỄN PHÍ. Bạn chỉ thanh toán phí khám khi đến phòng khám.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi cần đặt lịch trước bao lâu?', N'Nên đặt lịch trước ít nhất 1 ngày để đảm bảo có chỗ. Nếu gấp, bạn có thể gọi Hotline: 1900-565656 để được hỗ trợ ưu tiên.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi có thể đặt lịch cho người thân không?', N'Có, bạn có thể đặt lịch cho người thân. Chỉ cần nhập đầy đủ thông tin của họ khi đặt lịch.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi đặt lịch rồi có thể đổi giờ không?', N'Có thể đổi giờ. Vào mục Lịch Hẹn Của Tôi > Chọn lịch cần đổi > Đổi giờ. Hoặc gọi Hotline: 1900-565656 để được hỗ trợ.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn huỷ lịch khám thì phải làm gì?', N'Để hủy lịch khám:
1. Vào Lịch Hẹn Của Tôi
2. Chọn lịch cần hủy
3. Nhấn Hủy Lịch
4. Xác nhận

Lưu ý: Nên hủy trước 24 giờ để tránh tính phí. Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi không vào được hệ thống đặt lịch?', N'Nếu không vào được hệ thống:
- Kiểm tra kết nối mạng
- Thử đăng nhập lại
- Xóa cache trình duyệt
- Liên hệ Hotline: 1900-565656 để được hỗ trợ', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch khám ngoài giờ được không?', N'Phòng khám làm việc: Thứ 2-6 (8h-17h), Thứ 7 (8h-12h). Bạn có thể đặt lịch cho các khung giờ này. Gọi Hotline: 1900-565656 (24/7) nếu cần tư vấn.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi cần chọn bác sĩ hay phòng khám tự sắp xếp?', N'Bạn có thể chọn bác sĩ cụ thể khi đặt lịch. Nếu không chọn, hệ thống sẽ tự động sắp xếp bác sĩ phù hợp.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn đặt lịch khám ngay hôm nay có được không?', N'Được, nhưng phụ thuộc vào lịch trống. Gọi ngay Hotline: 1900-565656 để kiểm tra và đặt lịch nhanh nhất.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Sau khi đặt lịch có được nhắn tin xác nhận không?', N'Có, sau khi đặt lịch thành công, bạn sẽ nhận được SMS/Email xác nhận với thông tin chi tiết về lịch khám.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch xong có cần gọi lại hotline không?', N'Không cần. Sau khi đặt lịch online, bạn đã hoàn tất. Chỉ gọi Hotline: 1900-565656 nếu cần thay đổi hoặc hỗ trợ.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi đặt lịch nhưng chưa thấy xác nhận?', N'Kiểm tra email/SMS. Nếu không có sau 5 phút, vào mục Lịch Hẹn Của Tôi để xem hoặc gọi Hotline: 1900-565656.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn xem lại lịch khám của mình.', N'Đăng nhập > Vào mục Lịch Hẹn Của Tôi để xem tất cả lịch khám đã đặt, đang chờ và lịch sử khám bệnh.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch có cần thanh toán trước không?', N'Không cần thanh toán trước. Bạn thanh toán trực tiếp tại phòng khám sau khi khám xong.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch khám có cần nhập mã bệnh nhân không?', N'Không bắt buộc. Nếu đã khám trước đó, nhập mã bệnh nhân giúp tra cứu hồ sơ nhanh hơn.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn đặt lịch khám chuyên khoa X.', N'Vào Đặt Lịch Khám > Chọn Chuyên Khoa > Chọn chuyên khoa bạn cần > Chọn bác sĩ > Chọn giờ > Xác nhận.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi đang bị cấp cứu, đặt lịch có nhanh không?', N'Trường hợp cấp cứu, vui lòng GỌI NGAY Hotline: 1900-565656 hoặc đến trực tiếp phòng khám để được xử lý ưu tiên.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch khám tầm soát sức khỏe thế nào?', N'Chọn Dịch Vụ > Khám Tổng Quát/Tầm Soát Sức Khỏe > Chọn gói khám phù hợp > Đặt lịch. Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi quên mật khẩu tài khoản đặt lịch thì làm sao?', N'Nhấn "Quên mật khẩu" ở trang đăng nhập > Nhập email/SĐT > Nhận mã xác nhận > Đặt mật khẩu mới. Hotline: 1900-565656', N'account', 0, GETDATE(), 1, N'Import'),

(N'Đặt lịch khám có được chọn bác sĩ nữ không?', N'Có, khi đặt lịch bạn có thể lọc và chọn bác sĩ nữ theo chuyên khoa mong muốn.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Hôm nay bác sĩ A có lịch làm việc không?', N'Vào Đặt Lịch Khám > Tìm tên bác sĩ > Xem lịch làm việc. Hoặc gọi Hotline: 1900-565656 để hỏi trực tiếp.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi đặt lịch mà bị trùng giờ thì sao?', N'Hệ thống sẽ báo nếu trùng giờ và đề xuất khung giờ khác. Hoặc gọi Hotline: 1900-565656 để được hỗ trợ.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Trẻ em có cần đặt lịch riêng không?', N'Có, mỗi người cần 1 lịch khám riêng. Bạn có thể đặt nhiều lịch cho các thành viên gia đình.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn đặt lịch tái khám.', N'Vào Lịch Sử Khám > Chọn lần khám cần tái khám > Đặt Lịch Tái Khám. Hệ thống sẽ ưu tiên cùng bác sĩ.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Có thể đặt lịch cho ba/mẹ già được không?', N'Được, bạn có thể đặt lịch cho người thân. Nhập đầy đủ thông tin của họ khi đặt. Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Có thể đặt lịch theo ca (sáng/chiều) không?', N'Được, khi chọn giờ khám, hệ thống hiển thị các ca sáng (8h-12h) và chiều (13h-17h) để bạn chọn.', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Lịch khám của bác sĩ có thay đổi không?', N'Lịch có thể thay đổi đột xuất. Nếu thay đổi, bạn sẽ được thông báo qua SMS/Email. Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn biết khung giờ còn trống để đặt.', N'Vào Đặt Lịch Khám > Chọn ngày > Hệ thống hiển thị các khung giờ còn trống (màu xanh). Hotline: 1900-565656', N'booking', 0, GETDATE(), 1, N'Import');

GO

-- ===== NHÓM 2: BÁC SĨ =====

INSERT INTO ChatKnowledges (Question, Answer, Category, UsageCount, CreatedDate, IsActive, CreatedBy) VALUES
(N'Phòng khám có bao nhiêu bác sĩ?', N'Phòng khám có đội ngũ bác sĩ giàu kinh nghiệm. Xem danh sách đầy đủ tại mục Bác Sĩ hoặc Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ nào giỏi chuyên khoa X?', N'Tất cả bác sĩ đều có chuyên môn cao. Bạn có thể xem hồ sơ và đánh giá từ bệnh nhân tại trang Bác Sĩ.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ A làm việc vào ngày nào?', N'Xem lịch làm việc của bác sĩ tại trang Đặt Lịch Khám > Tìm tên bác sĩ. Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn xem thông tin của bác sĩ.', N'Vào trang Bác Sĩ > Chọn bác sĩ > Xem chi tiết về chuyên môn, kinh nghiệm, lịch làm việc.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ có kinh nghiệm bao nhiêu năm?', N'Thông tin kinh nghiệm của từng bác sĩ được hiển thị tại trang Bác Sĩ > Chi tiết bác sĩ.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Có bác sĩ khám ngoài giờ không?', N'Phòng khám làm Thứ 2-6 (8h-17h), Thứ 7 (8h-12h). Trường hợp khẩn cấp gọi Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn chọn bác sĩ cố định.', N'Khi đặt lịch, chọn bác sĩ cụ thể. Các lần sau hệ thống sẽ ưu tiên sắp xếp cùng bác sĩ đó.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ có giấy phép hành nghề không?', N'Tất cả bác sĩ đều có giấy phép hành nghề hợp lệ và được kiểm định chất lượng định kỳ.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ A có khám trẻ em không?', N'Xem chuyên khoa của bác sĩ tại trang Bác Sĩ. Bác sĩ chuyên khoa Nhi sẽ khám trẻ em.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn thay đổi bác sĩ.', N'Vào Lịch Hẹn > Chọn lịch cần đổi > Đổi bác sĩ. Hoặc gọi Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Lịch trực của bác sĩ hôm nay thế nào?', N'Xem lịch trực tại Đặt Lịch Khám hoặc gọi Hotline: 1900-565656 để biết bác sĩ nào đang trực.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ nữ khám chuyên khoa nào?', N'Vào trang Bác Sĩ > Lọc theo Giới tính: Nữ và Chuyên khoa cần tìm.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ có thể tư vấn online không?', N'Hiện tại phòng khám chưa có dịch vụ tư vấn online. Vui lòng đến trực tiếp hoặc gọi Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn gặp bác sĩ gấp, có được ưu tiên không?', N'Trường hợp khẩn cấp, gọi ngay Hotline: 1900-565656 để được ưu tiên và hỗ trợ nhanh nhất.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn biết đánh giá về bác sĩ X.', N'Xem đánh giá và nhận xét từ bệnh nhân tại trang Bác Sĩ > Chi tiết bác sĩ > Phần đánh giá.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Có bác sĩ nào đang rảnh không?', N'Vào Đặt Lịch Khám > Chọn ngày hôm nay > Xem khung giờ trống. Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi muốn đặt bác sĩ cho ca cấp cứu.', N'Ca cấp cứu vui lòng gọi ngay Hotline: 1900-565656 hoặc đến trực tiếp phòng khám.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Bác sĩ có nghỉ phép không?', N'Lịch nghỉ của bác sĩ sẽ được cập nhật và thông báo khi bạn đặt lịch. Hotline: 1900-565656', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Có thể xem hồ sơ bác sĩ không?', N'Có, vào trang Bác Sĩ > Chọn bác sĩ để xem hồ sơ chi tiết: chuyên môn, kinh nghiệm, chứng chỉ.', N'doctor', 0, GETDATE(), 1, N'Import'),

(N'Tôi tin tưởng bác sĩ A, muốn đặt lịch.', N'Vào Đặt Lịch Khám > Tìm tên bác sĩ A > Chọn ngày giờ > Xác nhận đặt lịch.', N'doctor', 0, GETDATE(), 1, N'Import');

GO

-- Tiếp tục với các nhóm khác...
-- Tạm dừng ở đây để test, bạn có thể chạy script này trước

SELECT COUNT(*) as TotalQuestions, Category, COUNT(*) as Count
FROM ChatKnowledges 
WHERE CreatedBy = N'Import'
GROUP BY Category
ORDER BY Count DESC;
