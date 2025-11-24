class ApiConfig {
  // Android Emulator: http://10.0.2.2:5129/api
  // iOS Simulator: http://localhost:5129/api
  // Physical Device: http://YOUR_IP:5129/api
  static const String baseUrl = 'http://10.0.2.2:5129/api';
  
  // Auth endpoints
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';
  
  // Doctors endpoints
  static const String doctorsEndpoint = '$baseUrl/doctors';
  
  // Booking endpoints
  static const String bookingEndpoint = '$baseUrl/booking';
  
  // Forgot Password endpoints
  static const String checkUsernameEndpoint = '$baseUrl/ForgotPassword/check-username';
  static const String sendOtpEndpoint = '$baseUrl/ForgotPassword/send-otp';
  static const String resetPasswordEndpoint = '$baseUrl/ForgotPassword/reset-password';
}
