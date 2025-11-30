using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Plugins;
using System.Text.Json;

namespace QuanLyKhamBenhAPI.Services;

public class ChatbotService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatService;
    private readonly ILogger<ChatbotService> _logger;

    public ChatbotService(
        IConfiguration configuration, 
        ILogger<ChatbotService> logger,
        QuanLyKhamBenhContext context)
    {
        _logger = logger;
        
        var geminiApiKey = configuration["Gemini:ApiKey"] 
            ?? throw new ArgumentException("Gemini API Key is not configured");

        _logger.LogInformation("Initializing Gemini with API Key: {Key}", 
            geminiApiKey.Substring(0, Math.Min(10, geminiApiKey.Length)) + "...");

        // Khởi tạo Semantic Kernel với Gemini và Plugin
        var builder = Kernel.CreateBuilder();
        
#pragma warning disable SKEXP0070
        try
        {
            builder.AddGoogleAIGeminiChatCompletion(
                modelId: "gemini-2.0-flash-exp",
                apiKey: geminiApiKey);
            _logger.LogInformation("Successfully configured Gemini model: gemini-2.0-flash-exp");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to configure Gemini connector");
            throw;
        }
#pragma warning restore SKEXP0070
        
        // Thêm plugin để AI có thể gọi các hàm nghiệp vụ
        var pluginLogger = new LoggerFactory().CreateLogger<ClinicPlugin>();
        builder.Plugins.AddFromObject(new ClinicPlugin(context, pluginLogger));

        _kernel = builder.Build();
        _chatService = _kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<string> GetChatResponseAsync(
        string userMessage, 
        PatientContextData? contextData = null,
        ChatHistory? history = null)
    {
        try
        {
            // Tạo chat history mới nếu chưa có
            history ??= new ChatHistory();

            // Thêm system prompt với context data
            if (history.Count == 0)
            {
                var systemPrompt = BuildSystemPrompt(contextData);
                history.AddSystemMessage(systemPrompt);
            }

            // Thêm tin nhắn người dùng
            history.AddUserMessage(userMessage);

            // Gọi Gemini với auto function calling enabled
#pragma warning disable SKEXP0070
            var settings = new GeminiPromptExecutionSettings
            {
                ToolCallBehavior = GeminiToolCallBehavior.AutoInvokeKernelFunctions
            };
#pragma warning restore SKEXP0070

            var response = await _chatService.GetChatMessageContentAsync(
                history, 
                executionSettings: settings,
                kernel: _kernel);

            return response.Content ?? "Xin lỗi, tôi không thể trả lời câu hỏi này.";
        }
        catch (Microsoft.SemanticKernel.HttpOperationException httpEx)
        {
            _logger.LogError(httpEx, 
                "HTTP Error calling Gemini - StatusCode: {StatusCode}, Message: {Message}, RequestUri: {RequestUri}", 
                httpEx.StatusCode, 
                httpEx.Message,
                httpEx.InnerException?.Message ?? "N/A");
            return "Xin lỗi, dịch vụ tư vấn tạm thời không khả dụng. Vui lòng thử lại sau.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chat response from Gemini: {ExceptionType} - {Message}", 
                ex.GetType().Name, ex.Message);
            return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
        }
    }

    private string BuildSystemPrompt(PatientContextData? contextData)
    {
        var prompt = @"Bạn là trợ lý ảo thông minh của Phòng Khám Evergreen Health.

**Nhiệm vụ:** Tư vấn cho bệnh nhân dựa trên dữ liệu hồ sơ được cung cấp.

**Quy tắc ứng xử:**
1. Trả lời ngắn gọn, thân thiện, xưng hô là 'Em' (trợ lý) và 'Anh/Chị' (bệnh nhân).
2. Dựa vào lịch sử khám để gợi ý. Luôn nhắc lại thông tin từ hồ sơ khi có liên quan.
3. **CẢNH BÁO QUAN TRỌNG:** Nếu bệnh nhân hỏi về triệu chứng nguy hiểm (đau ngực, khó thở, chảy máu nhiều, v.v.), hãy khuyên họ đến gặp bác sĩ hoặc cấp cứu NGAY LẬP TỨC, KHÔNG tự ý kê đơn thuốc.
4. Nếu họ muốn đặt lịch, hãy hướng dẫn họ vào mục 'Đặt lịch khám' trên ứng dụng.
5. Không được đưa ra chẩn đoán y khoa. Chỉ đưa ra thông tin tham khảo.
6. Luôn khuyến khích bệnh nhân gặp bác sĩ để được tư vấn chuyên sâu.

**Ngôn ngữ:** Tiếng Việt, tự nhiên và dễ hiểu.";

        if (contextData != null)
        {
            prompt += "\n\n**Dữ liệu bệnh nhân:**\n";
            prompt += JsonSerializer.Serialize(contextData, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }

        return prompt;
    }
}

// Data model cho context
public class PatientContextData
{
    public string? Ten { get; set; }
    public int? Tuoi { get; set; }
    public string? GioiTinh { get; set; }
    public List<LichSuKhamItem>? LichSuKham { get; set; }
    public LichHenSapToiItem? LichHenSapToi { get; set; }
    public List<string>? ChuyenKhoaCuaPhongKham { get; set; }
    public List<KetQuaXetNghiemItem>? KetQuaXetNghiem { get; set; }
    public List<LichSuThanhToanItem>? LichSuThanhToan { get; set; }
}

public class LichSuKhamItem
{
    public string? Ngay { get; set; }
    public string? BacSi { get; set; }
    public string? ChuyenKhoa { get; set; }
    public string? ChanDoan { get; set; }
    public string? DieuTri { get; set; }
}

public class LichHenSapToiItem
{
    public string? Ngay { get; set; }
    public string? Gio { get; set; }
    public string? BacSi { get; set; }
    public string? ChuyenKhoa { get; set; }
}

public class KetQuaXetNghiemItem
{
    public string? Ngay { get; set; }
    public string? ChiTiet { get; set; }
}

public class LichSuThanhToanItem
{
    public string? Ngay { get; set; }
    public decimal SoTien { get; set; }
    public string? PhuongThuc { get; set; }
    public string? TrangThai { get; set; }
}
