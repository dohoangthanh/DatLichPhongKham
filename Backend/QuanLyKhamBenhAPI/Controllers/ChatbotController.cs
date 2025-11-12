using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string? _apiKey;

        public ChatbotController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = configuration["Gemini:ApiKey"];
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatbotRequest request)
        {
            if (string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY_HERE")
            {
                return BadRequest("Gemini API key not configured");
            }

            var prompt = "Bạn là trợ lý y tế của phòng khám X. Chỉ trả lời các câu hỏi về sức khỏe, phòng khám, và các dịch vụ liên quan. Không trả lời các câu hỏi ngoài phạm vi này. Câu hỏi: " + request.Question;

            var client = _httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Error calling Gemini API");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

            var answer = result?.candidates?[0]?.content?.parts?[0]?.text ?? "Không thể trả lời";

            return Ok(new { Answer = answer });
        }
    }

    public class ChatbotRequest
    {
        public string? Question { get; set; }
    }

    public class GeminiResponse
    {
        public Candidate[]? candidates { get; set; }
    }

    public class Candidate
    {
        public Content? content { get; set; }
    }

    public class Content
    {
        public Part[]? parts { get; set; }
    }

    public class Part
    {
        public string? text { get; set; }
    }
}