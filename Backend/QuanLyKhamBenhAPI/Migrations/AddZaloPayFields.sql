-- Add ZaloPay columns to Payment table
ALTER TABLE Payments
ADD ZaloPayTransId NVARCHAR(255) NULL,
    ZaloPayTransToken NVARCHAR(500) NULL,
    QrCodeUrl NVARCHAR(1000) NULL;
GO

-- Create index for faster lookup
CREATE INDEX IX_Payments_ZaloPayTransId ON Payments(ZaloPayTransId);
GO
