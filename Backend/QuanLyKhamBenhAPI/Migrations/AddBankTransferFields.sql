-- Migration: Thêm fields cho Bank Transfer payment
-- Date: 2024-12-16

USE QuanLyKhamBenh;
GO

-- Thêm TransferContent và TransactionId vào bảng Payments
ALTER TABLE Payments
ADD TransferContent NVARCHAR(100) NULL,
    TransactionId NVARCHAR(100) NULL;
GO

-- Tạo index để tìm kiếm nhanh theo TransactionId
CREATE INDEX IX_Payments_TransactionId 
ON Payments(TransactionId)
WHERE TransactionId IS NOT NULL;
GO

-- Tạo index để tìm kiếm theo TransferContent
CREATE INDEX IX_Payments_TransferContent 
ON Payments(TransferContent)
WHERE TransferContent IS NOT NULL;
GO

PRINT 'Migration completed successfully!';
PRINT 'Added TransferContent and TransactionId fields to Payments table';
GO
