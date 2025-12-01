import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService extends ChangeNotifier {
  final SharedPreferences _prefs;
  String? _token;
  String? _username;
  String? _role;
  bool _isLoading = false;
  String? _loginError;

  AuthService(this._prefs) {
    _loadToken();
  }

  String? get token => _token;
  String? get username => _username;
  String? get role => _role;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  String? get loginError => _loginError;

  void _loadToken() {
    _token = _prefs.getString('auth_token');
    _username = _prefs.getString('username');
    _role = _prefs.getString('role');
    notifyListeners();
  }

  String? _decodeRole(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      
      final payload = parts[1];
      final normalized = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(normalized));
      final Map<String, dynamic> payloadMap = jsonDecode(decoded);
      
      // Check both possible claim names for role
      return payloadMap['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
          ?? payloadMap['role'];
    } catch (e) {
      debugPrint('Error decoding token: $e');
      return null;
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _loginError = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.loginEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      _isLoading = false;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token'];
        
        // Decode token to get role
        final role = _decodeRole(token);
        
        // Only allow Patient role
        if (role != 'Patient') {
          _loginError = 'Chỉ bệnh nhân mới có thể đăng nhập vào ứng dụng này';
          notifyListeners();
          return false;
        }
        
        _token = token;
        _username = username;
        _role = role;
        await _prefs.setString('auth_token', token);
        await _prefs.setString('username', username);
        if (role != null) {
          await _prefs.setString('role', role);
        }
        notifyListeners();
        return true;
      } else {
        _loginError = 'Tên đăng nhập hoặc mật khẩu không đúng';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _loginError = 'Có lỗi xảy ra. Vui lòng thử lại';
      notifyListeners();
      debugPrint('Login error: $e');
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String password,
    required String name,
    required String phone,
    required String address,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.registerEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
          'name': name,
          'phone': phone,
          'address': address,
        }),
      );

      _isLoading = false;

      if (response.statusCode == 200) {
        notifyListeners();
        return true;
      } else {
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('Register error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _username = null;
    _role = null;
    await _prefs.remove('auth_token');
    await _prefs.remove('username');
    await _prefs.remove('role');
    notifyListeners();
  }

  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_token',
    };
  }

  // Forgot Password - Check username
  Future<Map<String, dynamic>?> checkUsername(String username) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.checkUsernameEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        return {'error': error['error'] ?? 'Không tìm thấy tài khoản'};
      }
    } catch (e) {
      debugPrint('Check username error: $e');
      return {'error': 'Có lỗi xảy ra. Vui lòng thử lại'};
    }
  }

  // Forgot Password - Send OTP
  Future<Map<String, dynamic>?> sendOtp(String username) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.sendOtpEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'contactMethod': 'phone',
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'error': 'Không thể gửi mã xác thực'};
      }
    } catch (e) {
      debugPrint('Send OTP error: $e');
      return {'error': 'Có lỗi xảy ra. Vui lòng thử lại'};
    }
  }

  // Forgot Password - Reset password
  Future<Map<String, dynamic>?> resetPassword({
    required String username,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.resetPasswordEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'otp': otp,
          'newPassword': newPassword,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        return {'error': error['error'] ?? 'Không thể đặt lại mật khẩu'};
      }
    } catch (e) {
      debugPrint('Reset password error: $e');
      return {'error': 'Có lỗi xảy ra. Vui lòng thử lại'};
    }
  }
}
