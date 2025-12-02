using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using System.Text.RegularExpressions;

namespace QuanLyKhamBenhAPI.Services
{
    public enum IntentType
    {
        Unknown,
        DoctorQuery,
        SpecialtyQuery,
        ServiceQuery,
        BookingQuery,
        MyAppointmentQuery,
        PriceQuery,
        WorkingHoursQuery,
        Greeting,
        AboutClinic
    }

    public class Intent
    {
        public IntentType Type { get; set; }
        public Dictionary<string, string> Entities { get; set; } = new Dictionary<string, string>();
        public double Confidence { get; set; }
    }

    public class LocalChatbotService
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly ILogger<LocalChatbotService> _logger;
        private readonly IConfiguration _configuration;

        public LocalChatbotService(
            QuanLyKhamBenhContext context,
            ILogger<LocalChatbotService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<string> GetResponseAsync(string userMessage, int? patientId = null)
        {
            try
            {
                var normalizedMessage = NormalizeMessage(userMessage);

                // 1. Tìm trong knowledge base trước
                var knowledgeAnswer = await SearchKnowledgeBase(normalizedMessage);
                if (!string.IsNullOrEmpty(knowledgeAnswer))
                {
                    return knowledgeAnswer;
                }

                // 2. Phân tích intent thông minh
                var intent = DetectIntent(normalizedMessage, userMessage);

                // 3. Xử lý theo intent
                switch (intent.Type)
                {
                    case IntentType.DoctorQuery:
                        return await HandleDoctorQuery(normalizedMessage, intent.Entities);

                    case IntentType.SpecialtyQuery:
                        return await HandleSpecialtyQuery(normalizedMessage, intent.Entities);

                    case IntentType.ServiceQuery:
                        return await HandleServiceQuery(normalizedMessage, intent.Entities);

                    case IntentType.BookingQuery:
                        return HandleBookingQuery(patientId);

                    case IntentType.MyAppointmentQuery:
                        if (patientId.HasValue)
                            return await HandleMyAppointments(patientId.Value);
                        return "Bạn cần đăng nhập để xem lịch hẹn của mình.";

                    case IntentType.PriceQuery:
                        return await HandlePriceQuery(normalizedMessage);

                    case IntentType.WorkingHoursQuery:
                        return HandleWorkingHoursQuery();

                    case IntentType.Greeting:
                        return HandleGreeting();

                    case IntentType.AboutClinic:
                        return HandleAboutClinic();

                    default:
                        return GetDefaultResponse();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetResponseAsync");
                return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";
            }
        }

        private async Task<string> SearchKnowledgeBase(string normalizedMessage)
        {
            try
            {
                var knowledge = await _context.ChatKnowledges
                    .Where(k => k.IsActive)
                    .ToListAsync();

                foreach (var item in knowledge)
                {
                    var normalizedQuestion = NormalizeMessage(item.Question);
                    var similarity = CalculateSimilarity(normalizedMessage, normalizedQuestion);

                    if (similarity > 0.7) // 70% giống nhau
                    {
                        // Cập nhật usage
                        item.UsageCount++;
                        item.LastUsedDate = DateTime.Now;
                        await _context.SaveChangesAsync();

                        return item.Answer;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching knowledge base");
            }

            return string.Empty;
        }

        private Intent DetectIntent(string normalizedMessage, string originalMessage)
        {
            var intents = new List<(IntentType type, double score)>();

            // Phân tích từng loại intent với scoring
            intents.Add((IntentType.Greeting, CalculateIntentScore(normalizedMessage, new[] { "xin chao", "chao", "hello", "hi", "hey" })));
            intents.Add((IntentType.AboutClinic, CalculateIntentScore(normalizedMessage, new[] { "gioi thieu", "phong kham", "ve phong kham", "about", "clinic", "benh vien", "co so", "thong tin phong kham" })));
            intents.Add((IntentType.WorkingHoursQuery, CalculateIntentScore(normalizedMessage, new[] { "gio lam viec", "gio mo cua", "lam viec", "mo cua", "dong cua", "working hours" })));
            intents.Add((IntentType.DoctorQuery, CalculateIntentScore(normalizedMessage, new[] { "bac si", "bs", "doctor", "thay thuoc", "danh sach bac si", "co bac si nao" })));
            intents.Add((IntentType.SpecialtyQuery, CalculateIntentScore(normalizedMessage, new[] { "chuyen khoa", "khoa", "specialty", "co nhung khoa nao", "cac khoa" })));
            intents.Add((IntentType.ServiceQuery, CalculateIntentScore(normalizedMessage, new[] { "dich vu", "service", "kham", "xet nghiem", "cac dich vu", "dvu" })));
            intents.Add((IntentType.PriceQuery, CalculateIntentScore(normalizedMessage, new[] { "chi phi", "gia", "price", "bao nhieu tien", "cost", "phi", "tien kham" })));
            intents.Add((IntentType.BookingQuery, CalculateIntentScore(normalizedMessage, new[] { "dat lich", "dat hen", "booking", "dang ky kham", "hen kham", "muon kham" })));
            intents.Add((IntentType.MyAppointmentQuery, CalculateIntentScore(normalizedMessage, new[] { "lich hen", "lich kham", "appointment", "cuoc hen", "lich cua toi" })));

            // Lấy intent có điểm cao nhất
            var bestIntent = intents.OrderByDescending(i => i.score).First();

            // Extract entities từ câu hỏi
            var entities = ExtractEntities(originalMessage);

            return new Intent
            {
                Type = bestIntent.score > 0.3 ? bestIntent.type : IntentType.Unknown,
                Entities = entities,
                Confidence = bestIntent.score
            };
        }

        private double CalculateIntentScore(string message, string[] keywords)
        {
            double maxScore = 0;
            foreach (var keyword in keywords)
            {
                if (message.Contains(keyword))
                {
                    // Exact match = điểm cao
                    var score = keyword.Length / (double)Math.Max(message.Length, keyword.Length);
                    maxScore = Math.Max(maxScore, score);
                }
                else
                {
                    // Fuzzy match = điểm thấp hơn
                    var similarity = CalculateSimilarity(message, keyword);
                    if (similarity > 0.6)
                    {
                        maxScore = Math.Max(maxScore, similarity * 0.7);
                    }
                }
            }
            return maxScore;
        }

        private Dictionary<string, string> ExtractEntities(string message)
        {
            var entities = new Dictionary<string, string>();
            var lowerMessage = message.ToLower();

            // Extract tên bác sĩ nếu có
            var doctorMatch = Regex.Match(message, @"bác sĩ\s+([\p{L}\s]+)", RegexOptions.IgnoreCase);
            if (doctorMatch.Success)
            {
                entities["doctor_name"] = doctorMatch.Groups[1].Value.Trim();
            }

            // Extract chuyên khoa nếu có
            var specialtyKeywords = new[] { "tim mạch", "nội khoa", "ngoại khoa", "nhi khoa", "sản khoa", "da liễu", "mắt", "tai mũi họng" };
            foreach (var specialty in specialtyKeywords)
            {
                if (lowerMessage.Contains(specialty))
                {
                    entities["specialty"] = specialty;
                    break;
                }
            }

            return entities;
        }

        private bool IsDoctorQuery(string message)
        {
            var keywords = new[] { "bác sĩ", "bs", "doctor", "bác si", "bac si", "thầy thuốc" };
            return keywords.Any(k => message.Contains(k));
        }

        private async Task<string> HandleDoctorQuery(string message, Dictionary<string, string> entities)
        {
            IQueryable<Doctor> query = _context.Doctors.Include(d => d.Specialty);

            // Lọc theo specialty nếu có
            if (entities.ContainsKey("specialty"))
            {
                var specialtyName = entities["specialty"];
                query = query.Where(d => d.Specialty != null && d.Specialty.Name.ToLower().Contains(specialtyName.ToLower()));
            }

            // Lọc theo tên bác sĩ nếu có
            if (entities.ContainsKey("doctor_name"))
            {
                var doctorName = entities["doctor_name"];
                query = query.Where(d => d.Name.ToLower().Contains(doctorName.ToLower()));
            }

            var doctors = await query.Take(5).ToListAsync();

            if (!doctors.Any())
            {
                if (entities.Any())
                    return $"Không tìm thấy bác sĩ phù hợp với yêu cầu của bạn. Bạn có thể xem tất cả bác sĩ tại trang 'Đặt Lịch Khám'.";
                return "Hiện tại chưa có thông tin bác sĩ.";
            }

            var response = entities.ContainsKey("specialty")
                ? $"Bác sĩ chuyên khoa {entities["specialty"]}:\n\n"
                : "Danh sách bác sĩ của phòng khám:\n\n";

            foreach (var doctor in doctors)
            {
                response += $"BS. {doctor.Name}\n";
                response += $"   - Chuyên khoa: {doctor.Specialty?.Name ?? "Chưa xác định"}\n";
                response += $"   - Số điện thoại: {doctor.Phone}\n\n";
            }
            if (!entities.ContainsKey("doctor_name"))
                response += $"Tổng số: {await _context.Doctors.CountAsync()} bác sĩ\n";

            response += "\nBạn có thể đặt lịch khám tại trang 'Đặt Lịch Khám'";

            return response;
        }

        private bool IsSpecialtyQuery(string message)
        {
            var keywords = new[] { "chuyên khoa", "khoa", "specialty", "chuyen khoa" };
            return keywords.Any(k => message.Contains(k));
        }

        private async Task<string> HandleSpecialtyQuery(string message, Dictionary<string, string> entities)
        {
            var specialties = await _context.Specialties.ToListAsync();

            if (!specialties.Any())
                return "Hiện tại chưa có thông tin chuyên khoa.";

            // Nếu hỏi về chuyên khoa cụ thể
            if (entities.ContainsKey("specialty"))
            {
                var specialtyName = entities["specialty"];
                var specialty = specialties.FirstOrDefault(s => s.Name.ToLower().Contains(specialtyName.ToLower()));

                if (specialty != null)
                {
                    var doctorCount = await _context.Doctors
                        .Where(d => d.SpecialtyId == specialty.SpecialtyId)
                        .CountAsync();

                    var response = $"🏥 **{specialty.Name}**\n\n";
                    if (!string.IsNullOrEmpty(specialty.Description))
                        response += $"📝 {specialty.Description}\n\n";
                    response += $"👨‍⚕️ Hiện có {doctorCount} bác sĩ\n";
                    response += "\nBạn muốn xem danh sách bác sĩ chuyên khoa này không?";
                    return response;
                }
            }

            // Hiển thị tất cả chuyên khoa
            var allResponse = "Các chuyên khoa tại phòng khám:\n\n";
            foreach (var specialty in specialties)
            {
                var doctorCount = await _context.Doctors
                    .Where(d => d.SpecialtyId == specialty.SpecialtyId)
                    .CountAsync();

                allResponse += $"- {specialty.Name}";
                if (!string.IsNullOrEmpty(specialty.Description))
                    allResponse += $" - {specialty.Description}";
                allResponse += $" ({doctorCount} bác sĩ)\n";
            }

            return allResponse;
        }

        private bool IsServiceQuery(string message)
        {
            var keywords = new[] { "dịch vụ", "dvụ", "service", "khám", "xét nghiệm", "chi phí", "giá" };
            return keywords.Any(k => message.Contains(k));
        }

        private async Task<string> HandleServiceQuery(string message, Dictionary<string, string> entities)
        {
            var services = await _context.Services.ToListAsync();

            if (!services.Any())
                return "Hiện tại chưa có thông tin dịch vụ.";

            // Tìm dịch vụ cụ thể trong câu hỏi
            var serviceKeywords = new[] { "khám", "xét nghiệm", "siêu âm", "x-quang", "chụp", "xét" };
            var foundService = serviceKeywords.FirstOrDefault(k => message.Contains(k));

            if (foundService != null)
            {
                var matchedServices = services.Where(s => s.Name.ToLower().Contains(foundService)).ToList();
                if (matchedServices.Any())
                {
                    var response = $"Dịch vụ liên quan đến '{foundService}':\n\n";
                    foreach (var service in matchedServices.Take(5))
                    {
                        response += $"- {service.Name} - {service.Price:N0} VNĐ\n";
                    }
                    return response;
                }
            }

            // Hiển thị tất cả dịch vụ
            var allResponse = "Các dịch vụ tại phòng khám:\n\n";
            foreach (var service in services.Take(10))
            {
                allResponse += $"- {service.Name} - {service.Price:N0} VNĐ\n";
            }

            allResponse += $"\nTổng số: {services.Count} dịch vụ";
            return allResponse;
        }

        private async Task<string> HandlePriceQuery(string message)
        {
            // Tìm dịch vụ được hỏi giá
            var services = await _context.Services.ToListAsync();

            var matchedService = services.FirstOrDefault(s =>
                message.Contains(s.Name.ToLower()) ||
                s.Name.ToLower().Contains(message.Split(' ').FirstOrDefault() ?? ""));

            if (matchedService != null)
            {
                return $"{matchedService.Name}: {matchedService.Price:N0} VNĐ";
            }

            return await HandleServiceQuery(message, new Dictionary<string, string>());
        }

        private string HandleWorkingHoursQuery()
        {
            return "Giờ làm việc:\n\n" +
                   "Thứ 2 - Thứ 6: 8:00 - 17:00\n" +
                   "Thứ 7: 8:00 - 12:00\n" +
                   "Chủ nhật: Nghỉ\n\n" +
                   "Hotline: 1900-565656 (24/7)";
        }

        private string HandleGreeting()
        {
            var greetings = new[]
            {
                "Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp gì cho bạn?",
                "Chào bạn! Bạn muốn hỏi về bác sĩ, dịch vụ hay đặt lịch khám?",
                "Hello! Tôi có thể tư vấn cho bạn về các dịch vụ y tế của chúng tôi."
            };
            return greetings[new Random().Next(greetings.Length)];
        }

        private string HandleAboutClinic()
        {
            return "GIỚI THIỆU VỀ PHÒNG KHÁM\n\n" +
                   "Địa chỉ: 42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội\n\n" +
                   "Về chúng tôi:\n" +
                   "Phòng khám của chúng tôi tự hào là địa chỉ y tế tin cậy với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại và dịch vụ chăm sóc sức khỏe toàn diện.\n\n" +
                   "Sứ mệnh:\n" +
                   "Mang đến dịch vụ y tế chất lượng cao, chăm sóc tận tâm và tạo trải nghiệm tốt nhất cho bệnh nhân.\n\n" +
                   "Cam kết:\n" +
                   "- Đội ngũ bác sĩ chuyên môn cao\n" +
                   "- Trang thiết bị y tế hiện đại\n" +
                   "- Quy trình khám chữa bệnh chuyên nghiệp\n" +
                   "- Giá cả minh bạch, hợp lý\n" +
                   "- Hỗ trợ khách hàng 24/7\n\n" +
                   "Liên hệ: Hotline 1900-565656\n" +
                   "Website: medlatec.vn\n\n" +
                   "Bạn có muốn biết thêm về dịch vụ hoặc đặt lịch khám không?";
        }

        private bool IsBookingQuery(string message)
        {
            var keywords = new[] { "đặt lịch", "đặt hẹn", "booking", "đăng ký khám", "dat lich", "hen kham" };
            return keywords.Any(k => message.Contains(k));
        }

        private string HandleBookingQuery(int? patientId)
        {
            if (!patientId.HasValue)
            {
                return "Để đặt lịch khám, bạn cần đăng nhập tài khoản.\n\n" +
                       "Các bước đặt lịch:\n" +
                       "1. Đăng nhập vào hệ thống\n" +
                       "2. Vào trang 'Đặt lịch khám'\n" +
                       "3. Chọn chuyên khoa và bác sĩ\n" +
                       "4. Chọn ngày và giờ khám\n" +
                       "5. Xác nhận đặt lịch";
            }

            return "Để đặt lịch khám:\n\n" +
                   "1. Vào trang 'Đặt Lịch Khám'\n" +
                   "2. Chọn chuyên khoa phù hợp\n" +
                   "3. Chọn bác sĩ\n" +
                   "4. Chọn ngày và giờ khám\n" +
                   "5. Xác nhận thông tin\n\n" +
                   "Hoặc gọi hotline để được hỗ trợ!";
        }

        private bool IsMyAppointmentQuery(string message)
        {
            var keywords = new[] { "lịch hẹn", "appointment", "lich hen", "cuộc hẹn" };
            return keywords.Any(k => message.Contains(k));
        }

        private async Task<string> HandleMyAppointments(int patientId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .ThenInclude(d => d!.Specialty)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.Date)
                .Take(5)
                .ToListAsync();

            if (!appointments.Any())
                return "Bạn chưa có lịch hẹn nào. Bạn có muốn đặt lịch khám không?";

            var response = "Lịch hẹn của bạn:\n\n";
            foreach (var apt in appointments)
            {
                response += $"- Ngày: {apt.Date:dd/MM/yyyy} - {apt.Time}\n";
                response += $"  Bác sĩ: {apt.Doctor?.Name ?? "N/A"}\n";
                response += $"  Chuyên khoa: {apt.Doctor?.Specialty?.Name ?? "N/A"}\n";
                response += $"  Trạng thái: {apt.Status}\n\n";
            }

            return response;
        }

        private string GetDefaultResponse()
        {
            var responses = new[]
            {
                "Tôi có thể giúp bạn:\n- Thông tin bác sĩ và chuyên khoa\n- Dịch vụ khám bệnh\n- Hướng dẫn đặt lịch\n- Xem lịch hẹn của bạn\n\nBạn muốn biết điều gì?",
                "Bạn có thể hỏi tôi về:\n- Danh sách bác sĩ\n- Các chuyên khoa\n- Dịch vụ và giá cả\n- Cách đặt lịch khám",
                "Tôi là trợ lý ảo của phòng khám. Hãy hỏi tôi về bác sĩ, dịch vụ, hoặc cách đặt lịch nhé!"
            };

            return responses[new Random().Next(responses.Length)];
        }

        private string NormalizeMessage(string message)
        {
            message = message.ToLower().Trim();
            message = Regex.Replace(message, @"\s+", " ");
            // Loại bỏ dấu tiếng Việt để dễ so sánh
            message = RemoveVietnameseTones(message);
            return message;
        }

        private double CalculateSimilarity(string s1, string s2)
        {
            var longer = s1.Length > s2.Length ? s1 : s2;
            var shorter = s1.Length > s2.Length ? s2 : s1;

            if (longer.Length == 0) return 1.0;

            // Tính Levenshtein distance
            var distance = LevenshteinDistance(longer, shorter);
            return (longer.Length - distance) / (double)longer.Length;
        }

        private int LevenshteinDistance(string s1, string s2)
        {
            var matrix = new int[s1.Length + 1, s2.Length + 1];

            for (int i = 0; i <= s1.Length; i++)
                matrix[i, 0] = i;

            for (int j = 0; j <= s2.Length; j++)
                matrix[0, j] = j;

            for (int i = 1; i <= s1.Length; i++)
            {
                for (int j = 1; j <= s2.Length; j++)
                {
                    var cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                    matrix[i, j] = Math.Min(
                        Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                        matrix[i - 1, j - 1] + cost);
                }
            }

            return matrix[s1.Length, s2.Length];
        }

        private string RemoveVietnameseTones(string text)
        {
            var vietnameseChars = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
            var replacements = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

            for (int i = 0; i < vietnameseChars.Length; i++)
            {
                text = text.Replace(vietnameseChars[i], replacements[i]);
            }

            return text;
        }
    }
}
