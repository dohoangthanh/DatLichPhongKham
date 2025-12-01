-- Thêm Specialties (Chuyên khoa) nếu chưa có
IF NOT EXISTS (SELECT 1 FROM Specialty)
BEGIN
    INSERT INTO Specialty (name, description) VALUES
    ('Khoa Nhi', N'Chuyên khoa khám và điều trị các bệnh lý ở trẻ em'),
    ('Khoa Tim Mạch', N'Chuyên khoa khám và điều trị các bệnh lý về tim mạch'),
    ('Khoa Da Liễu', N'Chuyên khoa khám và điều trị các bệnh về da'),
    ('Khoa Tiêu Hóa', N'Chuyên khoa khám và điều trị các bệnh về hệ tiêu hóa'),
    ('Khoa Thần Kinh', N'Chuyên khoa khám và điều trị các bệnh lý thần kinh'),
    ('Khoa Tai Mũi Họng', N'Chuyên khoa khám và điều trị các bệnh về tai mũi họng'),
    ('Khoa Mắt', N'Chuyên khoa khám và điều trị các bệnh về mắt'),
    ('Khoa Xương Khớp', N'Chuyên khoa khám và điều trị các bệnh về xương khớp')
END

-- Kiểm tra kết quả
SELECT * FROM Specialty;
