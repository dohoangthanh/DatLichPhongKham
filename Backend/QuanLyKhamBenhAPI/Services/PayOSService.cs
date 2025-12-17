using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;

namespace QuanLyKhamBenhAPI.Services
{
    public class PayOSService
    {
        private readonly string _clientId;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly ILogger<PayOSService> _logger;
        private readonly HttpClient _httpClient;

        public PayOSService(IConfiguration configuration, ILogger<PayOSService> logger, HttpClient httpClient)
        {
            _clientId = configuration["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId is required");
            _apiKey = configuration["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey is required");
            _checksumKey = configuration["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey is required");
            _logger = logger;
            _httpClient = httpClient;
        }

        /// <summary>
        /// Tạo payment link với PayOS
        /// </summary>
        public async Task<PayOSCreateResponse> CreatePaymentLink(PayOSCreateRequest request)
        {
            try
            {
                var url = "https://api-merchant.payos.vn/v2/payment-requests";

                var requestBody = new
                {
                    orderCode = request.OrderCode,
                    amount = request.Amount,
                    description = request.Description,
                    returnUrl = request.ReturnUrl,
                    cancelUrl = request.CancelUrl
                };

                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
                _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);

                var response = await _httpClient.PostAsync(url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("PayOS API error: {StatusCode} - {Body}", response.StatusCode, responseBody);
                    throw new Exception($"PayOS API error: {responseBody}");
                }

                var result = JsonConvert.DeserializeObject<PayOSCreateResponse>(responseBody);
                return result ?? throw new Exception("Failed to parse PayOS response");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PayOS payment link");
                throw;
            }
        }

        /// <summary>
        /// Verify webhook từ PayOS
        /// </summary>
        public bool VerifyWebhook(string requestBody, string receivedSignature)
        {
            try
            {
                var calculatedSignature = CalculateSignature(requestBody);
                var isValid = calculatedSignature.Equals(receivedSignature, StringComparison.OrdinalIgnoreCase);

                if (!isValid)
                {
                    _logger.LogWarning("PayOS webhook verification failed. Expected: {Expected}, Received: {Received}",
                        calculatedSignature, receivedSignature);
                }

                return isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying PayOS webhook");
                return false;
            }
        }

        /// <summary>
        /// Tính signature theo chuẩn PayOS (HMAC-SHA256)
        /// </summary>
        private string CalculateSignature(string data)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_checksumKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        /// <summary>
        /// Lấy thông tin payment từ PayOS
        /// </summary>
        public async Task<PayOSPaymentInfo> GetPaymentInfo(long orderCode)
        {
            try
            {
                var url = $"https://api-merchant.payos.vn/v2/payment-requests/{orderCode}";

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
                _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);

                var response = await _httpClient.GetAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("PayOS API error: {StatusCode} - {Body}", response.StatusCode, responseBody);
                    throw new Exception($"PayOS API error: {responseBody}");
                }

                var result = JsonConvert.DeserializeObject<PayOSPaymentInfo>(responseBody);
                return result ?? throw new Exception("Failed to parse PayOS response");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PayOS payment info");
                throw;
            }
        }

        /// <summary>
        /// Parse webhook data từ PayOS
        /// </summary>
        public PayOSWebhookResponse? ParseWebhookData(string requestBody)
        {
            try
            {
                return JsonConvert.DeserializeObject<PayOSWebhookResponse>(requestBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse PayOS webhook data");
                return null;
            }
        }

        /// <summary>
        /// Extract payment ID từ description (format: "THANHTOAN {PaymentId}")
        /// </summary>
        public int? ExtractPaymentIdFromDescription(string description)
        {
            try
            {
                // Format: "THANHTOAN 123" hoặc "thanhtoan 123"
                var match = System.Text.RegularExpressions.Regex.Match(
                    description,
                    @"THANHTOAN\s+(\d+)",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );

                if (match.Success && int.TryParse(match.Groups[1].Value, out int paymentId))
                {
                    return paymentId;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }

    // ==================== DTOs ====================
    public class PayOSCreateRequest
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
    }

    public class PayOSCreateResponse
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public PayOSData? Data { get; set; }
    }

    public class PayOSData
    {
        public string Bin { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public long OrderCode { get; set; }
        public string Currency { get; set; } = "VND";
        public string PaymentLinkId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CheckoutUrl { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;
    }

    public class PayOSPaymentInfo
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public PayOSData? Data { get; set; }
    }

    public class PayOSWebhookResponse
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public PayOSWebhookData? Data { get; set; }
        public string Signature { get; set; } = string.Empty;
    }

    public class PayOSWebhookData
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string TransactionDateTime { get; set; } = string.Empty;
        public string PaymentLinkId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public string CounterAccountBankId { get; set; } = string.Empty;
        public string CounterAccountBankName { get; set; } = string.Empty;
        public string CounterAccountName { get; set; } = string.Empty;
        public string CounterAccountNumber { get; set; } = string.Empty;
        public string VirtualAccountName { get; set; } = string.Empty;
        public string VirtualAccountNumber { get; set; } = string.Empty;
    }
}
