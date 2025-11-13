import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../services/booking_service.dart';
import 'doctor_selection_screen.dart';

class SpecialtySelectionScreen extends StatefulWidget {
  const SpecialtySelectionScreen({super.key});

  @override
  State<SpecialtySelectionScreen> createState() => _SpecialtySelectionScreenState();
}

class _SpecialtySelectionScreenState extends State<SpecialtySelectionScreen> {
  final BookingService _bookingService = BookingService();
  final TextEditingController _searchController = TextEditingController();
  
  List<Specialty> _allSpecialties = [];
  List<Specialty> _filteredSpecialties = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSpecialties();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSpecialties() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final specialties = await _bookingService.getSpecialties();
      
      if (mounted) {
        setState(() {
          _allSpecialties = specialties;
          _filteredSpecialties = specialties;
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

  void _filterSpecialties(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredSpecialties = _allSpecialties;
      } else {
        _filteredSpecialties = _allSpecialties
            .where((specialty) => specialty.name.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Select a Specialty',
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
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              controller: _searchController,
              onChanged: _filterSpecialties,
              decoration: InputDecoration(
                hintText: 'Search for a specialty...',
                hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                prefixIcon: Icon(Icons.search, color: Colors.grey[400]),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF1E88E5),
                    ),
                  )
                : _error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, size: 64, color: Colors.red),
                              const SizedBox(height: 16),
                              Text('Error: $_error', textAlign: TextAlign.center),
                              const SizedBox(height: 24),
                              ElevatedButton(
                                onPressed: _loadSpecialties,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1E88E5),
                                ),
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : _filteredSpecialties.isEmpty
                        ? Center(
                            child: Text(
                              'No specialties found',
                              style: TextStyle(color: Colors.grey[600], fontSize: 16),
                            ),
                          )
                        : Container(
                            color: Colors.white,
                            child: ListView.separated(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              itemCount: _filteredSpecialties.length,
                              separatorBuilder: (context, index) => Divider(
                                height: 1,
                                color: Colors.grey[200],
                                indent: 16,
                                endIndent: 16,
                              ),
                              itemBuilder: (context, index) {
                                final specialty = _filteredSpecialties[index];
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  title: Text(
                                    specialty.name,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  trailing: Icon(
                                    Icons.arrow_forward_ios,
                                    size: 16,
                                    color: Colors.grey[400],
                                  ),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => DoctorSelectionScreen(
                                          specialty: specialty,
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
