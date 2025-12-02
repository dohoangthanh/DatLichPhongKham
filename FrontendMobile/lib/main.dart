import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/splash_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/appointments_history_screen.dart';
import 'screens/appointment_detail_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/invoice_screen.dart';
import 'screens/medical_record_screen.dart';
import 'screens/test_results_screen.dart';
import 'screens/review_screen.dart';
import 'screens/view_review_screen.dart';
import 'screens/doctors_list_screen.dart';
import 'screens/services_list_screen.dart';
import 'screens/profile_screen_new.dart' as new_profile;
import 'screens/chatbot_screen.dart';
import 'screens/specialty_selection_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService(prefs)),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VitaCare',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E88E5),
          primary: const Color(0xFF1E88E5),
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/welcome': (context) => const WelcomeScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/home': (context) => const HomeScreen(),
        '/appointments-history': (context) => const AppointmentsHistoryScreen(),
        '/doctors': (context) => const DoctorsListScreen(),
        '/services': (context) => const ServicesListScreen(),
        '/profile': (context) => const new_profile.ProfileScreen(),
        '/chatbot': (context) => const ChatbotScreen(),
        '/specialty-selection': (context) => const SpecialtySelectionScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/appointment-detail') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) =>
                AppointmentDetailScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/payment') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) => PaymentScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/invoice') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) => InvoiceScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/medical-record') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) =>
                MedicalRecordScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/test-results') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) =>
                TestResultsScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/review') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) => ReviewScreen(appointmentId: appointmentId),
          );
        }
        if (settings.name == '/view-review') {
          final appointmentId = settings.arguments as int;
          return MaterialPageRoute(
            builder: (context) =>
                ViewReviewScreen(appointmentId: appointmentId),
          );
        }
        return null;
      },
    );
  }
}
