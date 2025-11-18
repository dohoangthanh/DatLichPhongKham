import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/booking.dart';
import '../services/booking_service.dart';
import '../services/auth_service.dart';
import 'medical_record_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final BookingService _bookingService = BookingService();

  List<Appointment> _upcomingAppointments = [];
  List<Appointment> _pastAppointments = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAppointments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAppointments() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final appointments =
          await _bookingService.getMyAppointments(authService.token!);

      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);

      if (mounted) {
        setState(() {
          _upcomingAppointments = appointments.where((apt) {
            final aptDate = DateTime.tryParse(apt.date);
            return aptDate != null &&
                (aptDate.isAfter(today) || aptDate.isAtSameMomentAs(today));
          }).toList();
          _pastAppointments = appointments.where((apt) {
            final aptDate = DateTime.tryParse(apt.date);
            return aptDate != null && aptDate.isBefore(today);
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E88E5),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Medical History',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF1E88E5)),
            )
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error: $_error', textAlign: TextAlign.center),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loadAppointments,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E88E5),
                          ),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAppointmentsList(_upcomingAppointments, true),
                    _buildAppointmentsList(_pastAppointments, false),
                  ],
                ),
    );
  }

  Widget _buildAppointmentsList(List<Appointment> appointments, bool isUpcoming) {
    if (appointments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.calendar_today_outlined,
              size: 80,
              color: Colors.grey[300],
            ),
            const SizedBox(height: 16),
            Text(
              isUpcoming ? 'No Upcoming Appointments' : 'No Past Appointments',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.black54,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAppointments,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: appointments.length,
        itemBuilder: (context, index) {
          return _buildAppointmentCard(appointments[index], isUpcoming);
        },
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment appointment, bool isUpcoming) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: isUpcoming
              ? null
              : () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => MedicalRecordScreen(
                        appointmentId: appointment.appointmentId,
                      ),
                    ),
                  );
                },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E88E5).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.calendar_today,
                        color: Color(0xFF1E88E5),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDate(appointment.date),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatTime(appointment.time),
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(appointment.status),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  children: [
                    const Icon(Icons.medical_services,
                        size: 20, color: Color(0xFF1E88E5)),
                    const SizedBox(width: 8),
                    Text(
                      appointment.specialty?.name ?? 'General',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.person, size: 20, color: Color(0xFF1E88E5)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Dr. ${appointment.doctor?.name ?? 'Unknown'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                  ],
                ),
                if (!isUpcoming) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => MedicalRecordScreen(
                                appointmentId: appointment.appointmentId,
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.description,
                            size: 18, color: Color(0xFF1E88E5)),
                        label: const Text(
                          'View Record',
                          style: TextStyle(
                            color: Color(0xFF1E88E5),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;

    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        color = Colors.green;
        text = 'Confirmed';
        break;
      case 'cancelled':
        color = Colors.red;
        text = 'Cancelled';
        break;
      case 'completed':
        color = Colors.blue;
        text = 'Completed';
        break;
      default:
        color = Colors.grey;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
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
      return '${months[date.month - 1]} ${date.day}, ${date.year}';
    } catch (e) {
      return dateStr;
    }
  }

  String _formatTime(String timeStr) {
    if (timeStr.length > 5) {
      return timeStr.substring(0, 5);
    }
    return timeStr;
  }
}
