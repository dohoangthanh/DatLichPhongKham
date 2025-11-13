import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService extends ChangeNotifier {
  final SharedPreferences _prefs;
  String? _token;
  String? _username;
  bool _isLoading = false;

  AuthService(this._prefs) {
    _loadToken();
  }

  String? get token => _token;
  String? get username => _username;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  void _loadToken() {
    _token = _prefs.getString('auth_token');
    _username = _prefs.getString('username');
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
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
        _token = data['token'];
        _username = username;
        await _prefs.setString('auth_token', _token!);
        await _prefs.setString('username', username);
        notifyListeners();
        return true;
      } else {
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
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
    await _prefs.remove('auth_token');
    await _prefs.remove('username');
    notifyListeners();
  }

  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_token',
    };
  }
}
