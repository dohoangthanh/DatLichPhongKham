# VitaCare Mobile App

Ứng dụng di động cho hệ thống quản lý phòng khám VitaCare.

## Tính năng đã triển khai

### 1. Màn hình Splash
- Hiển thị logo VitaCare với thông điệp "Your Health, Our Priority"
- Tự động chuyển sang màn hình Welcome sau 3 giây
- Thiết kế màu xanh dương (#1E88E5) đồng bộ với hệ thống

### 2. Màn hình Welcome
- Giới thiệu ứng dụng với icon y tế
- 2 nút: Login và Sign Up
- Thiết kế gọn gàng, rõ ràng

### 3. Màn hình Login
- Form đăng nhập với username và password
- Hiển thị/ẩn mật khẩu
- Validation đầy đủ
- Tích hợp API đăng nhập từ Backend
- Lưu token vào shared_preferences
- Loading indicator khi đang xử lý

### 4. Màn hình Register
- Form đăng ký với các trường:
  - Full Name
  - Email Address (username)
  - Phone Number
  - Address
  - Password
  - Confirm Password
- Checkbox đồng ý điều khoản
- Validation đầy đủ cho tất cả các trường
- Tích hợp API đăng ký từ Backend
- Hiển thị/ẩn mật khẩu

### 5. Màn hình Home - Danh sách Bác sĩ
- Hiển thị danh sách bác sĩ từ API
- Thông tin hiển thị:
  - Tên bác sĩ
  - Chuyên khoa
  - Số điện thoại
- Pull-to-refresh để tải lại dữ liệu
- Xử lý lỗi với UI thân thiện
- Nút Logout ở AppBar

## Cấu trúc thư mục

```
lib/
├── config/
│   └── api_config.dart          # Cấu hình API endpoints
├── models/
│   └── doctor.dart              # Model Doctor và Specialty
├── screens/
│   ├── splash_screen.dart       # Màn hình splash
│   ├── welcome_screen.dart      # Màn hình welcome
│   ├── login_screen.dart        # Màn hình đăng nhập
│   ├── register_screen.dart     # Màn hình đăng ký
│   └── home_screen.dart         # Màn hình chính
├── services/
│   ├── auth_service.dart        # Service xử lý authentication
│   └── doctor_service.dart      # Service xử lý doctors API
└── main.dart                    # Entry point
```

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd FrontendMobile
flutter pub get
```

### 2. Cấu hình API URL
Mở file `lib/config/api_config.dart` và cập nhật `baseUrl` theo địa chỉ backend của bạn:
```dart
static const String baseUrl = 'http://your-backend-url/api';
```

**Lưu ý:** 
- Nếu chạy trên Android Emulator, sử dụng `http://10.0.2.2:5000/api`
- Nếu chạy trên iOS Simulator, sử dụng `http://localhost:5000/api`
- Nếu chạy trên thiết bị thật, sử dụng IP của máy chạy backend

### 3. Chạy ứng dụng
```bash
# Chạy trên Android
flutter run

# Chạy trên iOS
flutter run

# Chạy với hot reload
flutter run --hot
```

## Dependencies

- **flutter**: SDK chính
- **http**: ^1.1.0 - Gọi REST API
- **provider**: ^6.1.0 - Quản lý state
- **shared_preferences**: ^2.2.0 - Lưu trữ local (token)

## Tích hợp API

### Authentication API
- **POST /api/auth/login**
  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "string" }`

- **POST /api/auth/register**
  - Body: `{ "username": "string", "password": "string", "name": "string", "phone": "string", "address": "string" }`
  - Response: Success message

### Doctors API
- **GET /api/doctors**
  - Headers: `Authorization: Bearer {token}`
  - Response: Array of doctors with specialty info

## Thiết kế

### Màu sắc chính
- Primary: #1E88E5 (Xanh dương)
- Background: #FFFFFF (Trắng)
- Text: #000000DE (Đen 87%)
- Secondary Text: #00000099 (Đen 60%)

### Typography
- Font: Roboto (Material Design default)
- Heading: 28px, Bold
- Body: 16px, Regular
- Caption: 14px, Regular

## Roadmap tiếp theo

1. ✅ Splash Screen
2. ✅ Welcome Screen
3. ✅ Login Screen
4. ✅ Register Screen
5. ✅ Home Screen với danh sách bác sĩ
6. 🔲 Chi tiết bác sĩ
7. 🔲 Đặt lịch khám
8. 🔲 Lịch sử khám bệnh
9. 🔲 Thanh toán
10. 🔲 Đánh giá dịch vụ

## Ghi chú

- Ứng dụng sử dụng Material Design 3
- Tất cả màn hình đều responsive
- Xử lý loading và error states đầy đủ
- Token được lưu tự động và tái sử dụng cho các API call
- Không có file test và README dư thừa (theo yêu cầu)
