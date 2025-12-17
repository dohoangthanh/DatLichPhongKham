# Hướng dẫn khởi động Ngrok đúng port

## ⚠️ Vấn đề hiện tại

- Backend đang chạy: `http://localhost:5129`
- Ngrok đang forward: `http://localhost:5000` ❌
- Kết quả: **502 Bad Gateway** khi Casso gửi webhook

---

## ✅ Giải pháp

### Cách 1: Dừng Ngrok hiện tại và chạy lại với port đúng

```bash
# 1. Dừng Ngrok đang chạy (Ctrl+C trong terminal Ngrok)

# 2. Chạy lại với port 5129
ngrok http 5129
```

### Cách 2: Chạy Backend ở port 5000

```bash
# 1. Dừng backend hiện tại (Ctrl+C)

# 2. Chạy backend với port 5000
cd d:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI
dotnet run --urls "http://localhost:5000"
```

---

## 🔧 Khuyến nghị: Sử dụng Cách 1

**Chạy Ngrok với port 5129:**

```bash
ngrok http 5129
```

**Sau khi chạy, bạn sẽ thấy:**

```
Forwarding    https://nonabidingly-peevedly-marybeth.ngrok-free.dev -> http://localhost:5129
```

---

## 📋 Cấu hình Webhook trên Casso.vn

### 1. Đăng nhập Casso.vn

https://app.casso.vn/login

### 2. Vào Settings > Webhook

https://app.casso.vn/settings/webhook

### 3. Thêm Webhook URL

```
https://nonabidingly-peevedly-marybeth.ngrok-free.dev/api/payment/casso-webhook
```

### 4. Copy thông tin xác thực

Các thông tin này đã có trong `appsettings.json`:

- ✅ Client ID: `bfb9f5a5-41e2-4dd8-a265-374bd53d75a3`
- ✅ API Key: `77b00e9f-ba06-4fd8-a738-069abee19407`
- ✅ Checksum Key: `12beaa2a0fe64a5bcb1843ad0494738b406bbe0d2c67cafeda1d066c6d278d50`

### 5. Kết nối tài khoản ngân hàng

- Vào **Tài khoản ngân hàng** > **Thêm tài khoản**
- Chọn **MB Bank**
- Nhập:
  - Số tài khoản: **0977135812**
  - Tên tài khoản: **DO HOANG THANH**
- Làm theo hướng dẫn xác thực MB Bank

---

## 🧪 Test Webhook

### Sau khi cấu hình xong:

1. **Chuyển tiền test:**

   - Số tiền: **2.000 VND**
   - Nội dung: **THANHTOAN 51** (hoặc payment ID thật)
   - Đến: MB Bank 0977135812

2. **Kiểm tra Casso Dashboard:**

   - Vào https://app.casso.vn/transactions
   - Phải thấy giao dịch vừa chuyển

3. **Kiểm tra Backend log:**

   ```
   info: QuanLyKhamBenhAPI.Controllers.PaymentController[0]
         Received Casso webhook: {...}
   info: QuanLyKhamBenhAPI.Controllers.PaymentController[0]
         Payment 51 marked as Paid. Transaction ID: FT...
   ```

4. **Kiểm tra Frontend:**
   - PaymentModal tự động hiển thị "Thanh toán thành công!"
   - Modal đóng và reload trang

---

## 🐛 Troubleshooting

### Ngrok báo "502 Bad Gateway"

→ **Ngrok đang forward sai port**
→ Chạy lại: `ngrok http 5129`

### Casso không gửi webhook

→ **Chưa kết nối tài khoản MB Bank**
→ Vào Casso > Tài khoản ngân hàng > Thêm MB Bank

### Backend không nhận webhook

→ **Checksum key sai**
→ Kiểm tra lại trong Casso Settings > Webhook

### Webhook nhận nhưng payment không update

→ **Nội dung chuyển khoản sai format**
→ Phải đúng: `THANHTOAN {số}` (ví dụ: THANHTOAN 51)

---

## 🎯 Checklist hoàn chỉnh

- [ ] Backend đang chạy port 5129
- [ ] Ngrok forward đến port 5129
- [ ] Webhook URL: `https://nonabidingly-peevedly-marybeth.ngrok-free.dev/api/payment/casso-webhook`
- [ ] Casso đã kết nối MB Bank 0977135812
- [ ] Casso webhook URL đã cấu hình
- [ ] Test chuyển tiền với nội dung "THANHTOAN {id}"
- [ ] Backend log hiển thị "Received Casso webhook"
- [ ] Payment status tự động cập nhật "Paid"

---

## 💡 Lưu ý quan trọng

1. **Ngrok Free** có thể thay đổi URL mỗi lần restart

   - Nếu restart Ngrok, phải cập nhật lại URL trong Casso

2. **Casso Free** có giới hạn:

   - 30 ngày dùng thử
   - Sau đó cần upgrade plan

3. **Nếu không dùng Casso:**
   - Dùng trang Admin > Thanh toán để xác nhận thủ công
   - URL: http://localhost:3000/admin/payments
