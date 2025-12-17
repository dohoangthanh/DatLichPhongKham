using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Services;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace QuanLyKhamBenhAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CassoSyncController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly IConfiguration _configuration;
        private readonly CassoService _cassoService;
        private readonly ILogger<CassoSyncController> _logger;
        private readonly HttpClient _httpClient;

        public CassoSyncController(
            QuanLyKhamBenhContext context,
            IConfiguration configuration,
            CassoService cassoService,
            ILogger<CassoSyncController> logger,
            HttpClient httpClient)
        {
            _context = context;
            _configuration = configuration;
            _cassoService = cassoService;
            _logger = logger;
            _httpClient = httpClient;
        }

        /// <summary>
        /// Manual sync: Lấy danh sách giao dịch từ Casso API và cập nhật payments
        /// </summary>
        [HttpPost("manual-sync")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ManualSync([FromQuery] int? paymentId = null)
        {
            try
            {
                var apiKey = _configuration["Casso:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    return BadRequest("Casso API Key not configured");
                }

                // Get transactions from Casso API
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Apikey", apiKey);

                var response = await _httpClient.GetAsync("https://oauth.casso.vn/v2/transactions");

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest($"Casso API error: {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var cassoResponse = JsonConvert.DeserializeObject<CassoTransactionResponse>(content);

                if (cassoResponse?.Data?.Records == null || !cassoResponse.Data.Records.Any())
                {
                    return Ok(new { message = "No transactions found", updated = 0 });
                }

                int updatedCount = 0;

                // Process each transaction
                foreach (var transaction in cassoResponse.Data.Records)
                {
                    var extractedPaymentId = _cassoService.ExtractPaymentIdFromDescription(transaction.Description);

                    if (!extractedPaymentId.HasValue)
                        continue;

                    // If specific paymentId requested, skip others
                    if (paymentId.HasValue && extractedPaymentId.Value != paymentId.Value)
                        continue;

                    var payment = await _context.Payments
                        .FirstOrDefaultAsync(p => p.PaymentId == extractedPaymentId.Value);

                    if (payment == null || payment.Status == "Paid")
                        continue;

                    // Check amount match
                    if (Math.Abs(payment.TotalAmount - transaction.Amount) >= 1)
                        continue;

                    // Update payment
                    payment.Status = "Paid";
                    payment.PaymentDate = transaction.When;
                    payment.PaymentMethod = "Bank Transfer";
                    payment.TransactionId = transaction.Tid;

                    updatedCount++;

                    _logger.LogInformation("Manual sync updated Payment #{PaymentId} from Transaction {Tid}",
                        payment.PaymentId, transaction.Tid);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Synced successfully. Updated {updatedCount} payment(s)",
                    updated = updatedCount,
                    total = cassoResponse.Data.Records.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // DTOs for Casso API response
    public class CassoTransactionResponse
    {
        public CassoData? Data { get; set; }
    }

    public class CassoData
    {
        public List<CassoTransaction>? Records { get; set; }
    }

    public class CassoTransaction
    {
        public long Id { get; set; }
        public string? Tid { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime When { get; set; }
    }
}
