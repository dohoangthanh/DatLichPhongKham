# Setup Chat Realtime cho Mobile (Flutter)

## 📦 Cài đặt dependencies

```bash
cd FrontendMobile
flutter pub get
```

## 🔧 Cấu hình

### 1. Android Emulator

File đã config sẵn: `http://10.0.2.2:5129`

### 2. iOS Simulator

Sửa trong `lib/config/api_config.dart`:

```dart
static const String baseUrl = 'http://localhost:5129/api';
static const String chatHubUrl = 'http://localhost:5129/chatHub';
```

### 3. Physical Device (Điện thoại thật)

Tìm IP máy tính bạn (Windows: `ipconfig`, Mac/Linux: `ifconfig`):

```dart
static const String baseUrl = 'http://YOUR_IP:5129/api';
static const String chatHubUrl = 'http://YOUR_IP:5129/chatHub';
```

Ví dụ:

```dart
static const String baseUrl = 'http://192.168.1.100:5129/api';
static const String chatHubUrl = 'http://192.168.1.100:5129/chatHub';
```

## ✨ Tính năng đã thêm

### Patient Mobile App:

- ✅ Tab chuyển đổi: **Trợ lý AI** ↔️ **Chat Admin**
- ✅ Kết nối SignalR realtime với backend
- ✅ Nhận tin nhắn từ admin ngay lập tức (không cần reload)
- ✅ Hiển thị trạng thái kết nối (🟢 Đang kết nối / 🔴 Chưa kết nối)
- ✅ Load lịch sử tin nhắn với admin
- ✅ Gửi tin nhắn đến admin qua REST API + SignalR

### Admin Web:

- ✅ Xem tất cả conversations từ patient (kể cả mobile)
- ✅ Nhận tin nhắn realtime từ patient mobile
- ✅ Reply và patient mobile nhận ngay lập tức

## 🚀 Test Flow

1. **Khởi động Backend:**

   ```bash
   cd Backend/QuanLyKhamBenhAPI
   dotnet run
   ```

2. **Khởi động Web Admin:**

   ```bash
   cd FrontendWeb
   npm run dev
   ```

   - Mở http://localhost:5265
   - Login admin
   - Vào trang Chat với Bệnh nhân

3. **Khởi động Mobile App:**

   ```bash
   cd FrontendMobile
   flutter run
   ```

   - Login patient
   - Vào Chatbot screen
   - Chuyển tab sang "Chat Admin"

4. **Test Realtime:**
   - Mobile gửi tin → Admin web nhận ngay (không reload)
   - Admin web reply → Mobile nhận ngay (không reload)

## 🔍 Cấu trúc code mới

```
FrontendMobile/lib/
├── services/
│   ├── chatbot_service.dart         (AI chatbot - đã có sẵn)
│   └── admin_chat_service.dart      (NEW - Admin chat + SignalR)
├── models/
│   └── chat_message.dart            (Updated - thêm senderRole)
├── screens/
│   └── chatbot_screen.dart          (Updated - thêm tab switching)
└── config/
    └── api_config.dart              (Updated - thêm chatHubUrl)
```

## 📱 UI Features

### Mode Switching Tabs:

```
┌─────────────┬─────────────┐
│ 🤖 Trợ lý AI │ 👤 Chat Admin│
└─────────────┴─────────────┘
```

### Chat Bubbles:

- **Patient**: Màu xanh, bên phải
- **Admin**: Màu xám, bên trái, có tên admin
- **AI**: Màu xám, bên trái, icon robot

## ⚠️ Lưu ý

1. **Network Security (Android):**

   - Đã config http cleartext trong `android/app/src/main/AndroidManifest.xml`
   - Cho phép kết nối http://10.0.2.2:5129

2. **iOS:**

   - Cần config App Transport Security trong `ios/Runner/Info.plist`
   - Cho phép kết nối http://localhost:5129

3. **SignalR Connection:**
   - Tự động reconnect khi mất kết nối
   - Log chi tiết trong console để debug

## 🐛 Troubleshooting

### Không kết nối được SignalR:

```bash
# Check backend đang chạy
curl http://localhost:5129/api/chat/test

# Check SignalR hub
curl http://localhost:5129/chatHub
```

### Android Emulator không kết nối được:

- Dùng `10.0.2.2` thay vì `localhost`
- Check firewall Windows cho phép port 5129

### Physical device không kết nối được:

- Đảm bảo cùng mạng WiFi với máy tính
- Check IP máy tính: `ipconfig` (Windows)
- Firewall cho phép incoming connections

## 📊 Test Cases

✅ Mobile patient chat với admin web → Realtime
✅ Admin web reply patient mobile → Realtime  
✅ Nhiều patient mobile cùng chat → Admin thấy tất cả conversations
✅ Mất kết nối → Tự động reconnect
✅ Reload app → Load lịch sử tin nhắn
✅ Switch giữa AI và Admin mode → Messages riêng biệt

## 🎉 Hoàn thành!

Giờ bạn có:

- 📱 Mobile App (Flutter) có AI chatbot + Admin chat realtime
- 💻 Web Admin có chat management với realtime updates
- 🔄 SignalR kết nối cả mobile và web về cùng backend
- ⚡ Tin nhắn realtime 2 chiều không cần reload
