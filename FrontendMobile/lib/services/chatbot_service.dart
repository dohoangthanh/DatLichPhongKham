import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ChatbotService {
  Future<String> askQuestion(String token, String question) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/chatbot/ask'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'question': question,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['answer'] ?? 'Không thể trả lời câu hỏi này.';
      } else if (response.statusCode == 400) {
        return 'Xin lỗi, chatbot hiện chưa được cấu hình. Vui lòng thử lại sau.';
      } else {
        throw Exception('Failed to get answer');
      }
    } catch (e) {
      throw Exception('Error asking question: $e');
    }
  }
}
