using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;

namespace QuanLyKhamBenhAPI.Services
{
    public class CassoService
    {
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly ILogger<CassoService> _logger;

        public CassoService(IConfiguration configuration, ILogger<CassoService> logger)
        {
            _apiKey = configuration["Casso:ApiKey"] ?? throw new ArgumentNullException("Casso:ApiKey is required");
            _checksumKey = configuration["Casso:ChecksumKey"] ?? throw new ArgumentNullException("Casso:ChecksumKey is required");
            _logger = logger;
        }

        /// <summary>
        /// Xác thực webhook từ Casso.vn
        /// Casso gửi checksum trong header hoặc body để verify tính hợp lệ
        /// </summary>
        public bool VerifyWebhook(string requestBody, string receivedChecksum)
        {
            try
            {
                var calculatedChecksum = CalculateChecksum(requestBody);
                var isValid = calculatedChecksum.Equals(receivedChecksum, StringComparison.OrdinalIgnoreCase);

                if (!isValid)
                {
                    _logger.LogWarning("Casso webhook verification failed. Expected: {Expected}, Received: {Received}",
                        calculatedChecksum, receivedChecksum);
                }

                return isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Casso webhook");
                return false;
            }
        }

        /// <summary>
        /// Tính checksum theo chuẩn Casso
        /// Checksum = HMAC-SHA256(ChecksumKey, RequestBody)
        /// </summary>
        private string CalculateChecksum(string data)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_checksumKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }

        /// <summary>
        /// Parse webhook data từ Casso
        /// </summary>
        public CassoWebhookData? ParseWebhookData(string requestBody)
        {
            try
            {
                var webhookData = JsonConvert.DeserializeObject<CassoWebhookData>(requestBody);
                return webhookData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing Casso webhook data: {Body}", requestBody);
                return null;
            }
        }

        /// <summary>
        /// Tìm payment ID từ nội dung chuyển khoản
        /// Format: "PK000007" hoặc "PK 7" hoặc "THANHTOAN 7" (backward compatible)
        /// </summary>
        public int? ExtractPaymentIdFromDescription(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                return null;

            // Pattern 1: PK + số (có thể có số 0 đằng trước)
            var match = System.Text.RegularExpressions.Regex.Match(
                description,
                @"PK[\s]*(\d+)",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            // Pattern 2: Fallback - THANHTOAN + số (để tương thích ngược)
            if (!match.Success)
            {
                match = System.Text.RegularExpressions.Regex.Match(
                    description,
                    @"THANHTOAN[\s]*(\d+)",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
            }

            if (match.Success && int.TryParse(match.Groups[1].Value, out int paymentId))
            {
                return paymentId;
            }

            _logger.LogWarning("Could not extract payment ID from description: {Description}", description);
            return null;
        }
    }

    /// <summary>
    /// Model cho webhook data từ Casso.vn
    /// </summary>
    public class CassoWebhookData
    {
        [JsonProperty("data")]
        public List<CassoTransaction> Data { get; set; } = new();

        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("message")]
        public string? Message { get; set; }
    }

    /// <summary>
    /// Model cho từng giao dịch trong webhook
    /// </summary>
    public class CassoTransaction
    {
        /// <summary>
        /// ID giao dịch trong hệ thống Casso
        /// </summary>
        [JsonProperty("id")]
        public long Id { get; set; }

        /// <summary>
        /// Transaction ID từ ngân hàng (VD: FT21365000123)
        /// Dùng để đối chiếu với sao kê ngân hàng
        /// </summary>
        [JsonProperty("tid")]
        public string Tid { get; set; } = string.Empty;

        /// <summary>
        /// Nội dung chuyển khoản (VD: "THANHTOAN 123")
        /// </summary>
        [JsonProperty("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Số tiền giao dịch (VND)
        /// </summary>
        [JsonProperty("amount")]
        public decimal Amount { get; set; }

        /// <summary>
        /// Thời gian giao dịch
        /// </summary>
        [JsonProperty("when")]
        public DateTime When { get; set; }

        /// <summary>
        /// ID tài khoản ngân hàng trong Casso
        /// </summary>
        [JsonProperty("bank_sub_acc_id")]
        public string BankSubAccId { get; set; } = string.Empty;

        /// <summary>
        /// Tên tài khoản đối tác (người chuyển tiền)
        /// </summary>
        [JsonProperty("subAccId")]
        public string? SubAccId { get; set; }

        /// <summary>
        /// Số dư sau giao dịch
        /// </summary>
        [JsonProperty("cusum_balance")]
        public decimal? CusumBalance { get; set; }
    }
}
