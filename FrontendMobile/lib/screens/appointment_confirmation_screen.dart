import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/booking.dart';
import '../services/booking_service.dart';
import '../services/auth_service.dart';
import '../config/api_config.dart';

class AppointmentConfirmationScreen extends StatelessWidget {
  final BookingDoctor doctor;
  final Specialty specialty;
  final DateTime date;
  final String time;

  const AppointmentConfirmationScreen({
    super.key,
    required this.doctor,
    required this.specialty,
    required this.date,
    required this.time,
  });

  String _formatFullDate(DateTime date) {
    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    final weekday = weekdays[(date.weekday - 1) % 7];
    final month = months[date.month - 1];
    return '$weekday, $month ${date.day}, ${date.year}';
  }

  Future<void> _confirmBooking(BuildContext context) async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final bookingService = BookingService();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF1E88E5)),
      ),
    );

    try {
      final year = date.year.toString();
      final month = date.month.toString().padLeft(2, '0');
      final day = date.day.toString().padLeft(2, '0');
      final dateString = '$year-$month-$day';

      final appointmentId = await bookingService.createAppointment(
        token: authService.token!,
        doctorId: doctor.doctorId,
        date: dateString,
        time: time,
      );

      if (context.mounted) {
        Navigator.pop(context);

        if (appointmentId != null) {
          // Navigate to appointment detail screen
          Navigator.pushNamedAndRemoveUntil(
            context,
            '/appointment-detail',
            (route) => route.settings.name == '/home',
            arguments: appointmentId,
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to book appointment'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Confirm Appointment',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      doctor.imageUrl != null && doctor.imageUrl!.isNotEmpty
                          ? CircleAvatar(
                              radius: 36,
                              backgroundColor: const Color(0xFF1E88E5)
                                  .withValues(alpha: 0.1),
                              backgroundImage: NetworkImage(
                                doctor.imageUrl!.startsWith('http')
                                    ? doctor.imageUrl!
                                    : '${ApiConfig.baseUrl.replaceAll('/api', '')}${doctor.imageUrl}',
                              ),
                              onBackgroundImageError: (exception, stackTrace) {
                                print('Error loading image: $exception');
                              },
                            )
                          : CircleAvatar(
                              radius: 36,
                              backgroundColor: const Color(0xFF1E88E5)
                                  .withValues(alpha: 0.1),
                              child: Text(
                                doctor.name.isNotEmpty
                                    ? doctor.name[0].toUpperCase()
                                    : 'D',
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1E88E5),
                                ),
                              ),
                            ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Dr. ${doctor.name}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              specialty.name,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Divider(height: 1, color: Colors.grey[200]),
                  const SizedBox(height: 24),
                  _buildInfoRow('Date', _formatFullDate(date)),
                  const SizedBox(height: 20),
                  _buildInfoRow(
                      'Time', time.length > 5 ? time.substring(0, 5) : time),
                  const SizedBox(height: 20),
                  _buildInfoRow('Location', 'Evergreen Health Clinic'),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () => _confirmBooking(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E88E5),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Confirm Booking',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Change Details',
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ),
      ],
    );
  }
}
