using System.Text;

namespace QuanLyKhamBenhAPI.Services
{
    public class VietQRService
    {
        private readonly string _bankCode;
        private readonly string _accountNumber;
        private readonly string _accountName;

        public VietQRService(IConfiguration configuration)
        {
            _bankCode = configuration["Casso:BankCode"] ?? "970422"; // MB Bank
            _accountNumber = configuration["Casso:AccountNumber"] ?? "0977135812";
            _accountName = configuration["Casso:AccountName"] ?? "DO HOANG THANH";
        }

        /// <summary>
        /// Tạo QR code VietQR sử dụng API VietQR.io
        /// QR này tương thích với TẤT CẢ app ngân hàng tại Việt Nam:
        /// MB Bank, Sacombank, MoMo, VietQR, Vietcombank, Techcombank, v.v.
        /// </summary>
        public VietQRData GenerateVietQR(decimal amount, string transferContent)
        {
            // Sử dụng VietQR.io API để tạo QR code chuẩn NAPAS
            // API này miễn phí và tự động điền đầy đủ thông tin:
            // - Ngân hàng
            // - Số tài khoản
            // - Tên người nhận
            // - Số tiền
            // - Nội dung chuyển khoản

            var sanitizedContent = SanitizeTransferContent(transferContent);
            var amountInt = (int)Math.Round(amount);

            // Format URL theo VietQR.io API
            // https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={CONTENT}&accountName={NAME}
            var qrImageUrl = $"https://img.vietqr.io/image/{_bankCode}-{_accountNumber}-compact.png?amount={amountInt}&addInfo={Uri.EscapeDataString(sanitizedContent)}&accountName={Uri.EscapeDataString(_accountName)}";

            // Tạo QR data URL cho việc nhúng trực tiếp vào QR code component
            var qrDataUrl = $"https://img.vietqr.io/image/{_bankCode}-{_accountNumber}-compact2.jpg?amount={amountInt}&addInfo={Uri.EscapeDataString(sanitizedContent)}&accountName={Uri.EscapeDataString(_accountName)}";

            return new VietQRData
            {
                QrContent = qrDataUrl, // URL ảnh QR code
                QrImageUrl = qrImageUrl, // URL ảnh QR alternative
                BankCode = _bankCode,
                BankName = GetBankName(_bankCode),
                AccountNumber = _accountNumber,
                AccountName = _accountName,
                Amount = amount,
                TransferContent = sanitizedContent
            };
        }

        private string GetBankName(string bankCode)
        {
            // Mapping bank code to bank name
            return bankCode switch
            {
                "970422" => "MB Bank (Ngân hàng Quân đội)",
                "970403" => "Sacombank",
                "970436" => "Vietcombank",
                "970407" => "Techcombank",
                "970415" => "VietinBank",
                "970432" => "VPBank",
                "970405" => "Agribank",
                "970416" => "ACB",
                "970418" => "BIDV",
                _ => "MB Bank"
            };
        }

        private string SanitizeTransferContent(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return "THANHTOAN";

            // Chỉ giữ chữ cái, số và khoảng trắng
            var sanitized = new string(content
                .Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
                .ToArray())
                .Trim()
                .ToUpper();

            // Giới hạn độ dài
            return sanitized.Length > 50 ? sanitized.Substring(0, 50) : sanitized;
        }
    }

    public class VietQRData
    {
        public string QrContent { get; set; } = string.Empty; // QR data URL
        public string QrImageUrl { get; set; } = string.Empty; // QR image URL alternative
        public string BankCode { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransferContent { get; set; } = string.Empty;
    }
}
