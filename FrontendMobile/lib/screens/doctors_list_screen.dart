import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/patient_service.dart';

class DoctorsListScreen extends StatefulWidget {
  const DoctorsListScreen({super.key});

  @override
  State<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends State<DoctorsListScreen> {
  final PatientService _patientService = PatientService();
  List<dynamic> _doctors = [];
  List<dynamic> _specialties = [];
  bool _isLoading = true;
  int? _selectedSpecialtyId;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      if (authService.token != null) {
        final doctors = await _patientService.getDoctors(authService.token!);
        final specialties =
            await _patientService.getSpecialties(authService.token!);

        if (mounted) {
          setState(() {
            _doctors = doctors;
            _specialties = specialties;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      print('Error loading doctors: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải danh sách bác sĩ')),
        );
      }
    }
  }

  List<dynamic> get _filteredDoctors {
    var filtered = _doctors;

    // Filter by specialty
    if (_selectedSpecialtyId != null) {
      filtered = filtered.where((doctor) {
        final specialty = doctor['specialty'];
        return specialty != null &&
            specialty['specialtyId'] == _selectedSpecialtyId;
      }).toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((doctor) {
        final name = doctor['name']?.toString().toLowerCase() ?? '';
        final specialtyName =
            doctor['specialty']?['name']?.toString().toLowerCase() ?? '';
        final query = _searchQuery.toLowerCase();
        return name.contains(query) || specialtyName.contains(query);
      }).toList();
    }

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color(0xFF64B5F6),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Đội Ngũ Bác Sĩ',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search and Filter Section
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Search bar
                      TextField(
                        onChanged: (value) {
                          setState(() => _searchQuery = value);
                        },
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm bác sĩ...',
                          prefixIcon: const Icon(Icons.search),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                const BorderSide(color: Color(0xFF64B5F6)),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Specialty filter chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            FilterChip(
                              label: const Text('Tất cả'),
                              selected: _selectedSpecialtyId == null,
                              onSelected: (selected) {
                                setState(() => _selectedSpecialtyId = null);
                              },
                              selectedColor: const Color(0xFF64B5F6),
                              labelStyle: TextStyle(
                                color: _selectedSpecialtyId == null
                                    ? Colors.white
                                    : Colors.black87,
                              ),
                            ),
                            const SizedBox(width: 8),
                            ..._specialties.map((specialty) {
                              final id = specialty['specialtyId'];
                              final name = specialty['name'] ?? '';
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: FilterChip(
                                  label: Text(name),
                                  selected: _selectedSpecialtyId == id,
                                  onSelected: (selected) {
                                    setState(() {
                                      _selectedSpecialtyId =
                                          selected ? id : null;
                                    });
                                  },
                                  selectedColor: const Color(0xFF64B5F6),
                                  labelStyle: TextStyle(
                                    color: _selectedSpecialtyId == id
                                        ? Colors.white
                                        : Colors.black87,
                                  ),
                                ),
                              );
                            }).toList(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // Doctors List
                Expanded(
                  child: _filteredDoctors.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off,
                                  size: 64, color: Colors.grey[400]),
                              const SizedBox(height: 16),
                              Text(
                                'Không tìm thấy bác sĩ',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredDoctors.length,
                          itemBuilder: (context, index) {
                            return _buildDoctorCard(_filteredDoctors[index]);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildDoctorCard(dynamic doctor) {
    final name = doctor['name'] ?? 'N/A';
    final phone = doctor['phone'] ?? 'N/A';
    final imageUrl = doctor['imageUrl'];
    final specialty = doctor['specialty'];
    final specialtyName = specialty?['name'] ?? 'Chưa có chuyên khoa';

    // Build full image URL
    final fullImageUrl = imageUrl != null && imageUrl.isNotEmpty
        ? 'http://10.0.2.2:5129$imageUrl'
        : null;

    // Debug logging
    print('Doctor: $name');
    print('Original imageUrl: $imageUrl');
    print('Full imageUrl: $fullImageUrl');

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.grey[200],
                image: fullImageUrl != null
                    ? DecorationImage(
                        image: NetworkImage(fullImageUrl),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: fullImageUrl == null
                  ? const Icon(Icons.person, size: 40, color: Colors.grey)
                  : null,
            ),
            const SizedBox(width: 16),
            // Doctor Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BS. $name',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.medical_services,
                          size: 16, color: Color(0xFF64B5F6)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          specialtyName,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF64B5F6),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.phone, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 6),
                      Text(
                        phone,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Booking Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushNamed(context, '/home');
                        Future.delayed(const Duration(milliseconds: 100), () {
                          Navigator.pushNamed(context, '/specialty-selection');
                        });
                      },
                      icon: const Icon(Icons.calendar_month, size: 16),
                      label: const Text('Đặt Lịch Khám'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF64B5F6),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
