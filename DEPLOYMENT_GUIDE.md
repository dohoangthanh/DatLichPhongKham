# 🚀 HƯỚNG DẪN DEPLOY FREE - Phòng Khám Đa Khoa

## 📋 Tech Stack hiện tại

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: ASP.NET Core 8.0 Web API (C#)
- **Database**: SQL Server LocalDB
- **External APIs**: Gemini AI, PayOS

---

## 🎯 Option 1: Deploy Free (Recommended)

### **Platform lựa chọn:**

- **Frontend**: Vercel (Free)
- **Backend**: Railway.app hoặc Render.com (Free tier)
- **Database**: PostgreSQL on Railway/Render (Free)

### **Chi phí:**

- ✅ $0/month
- ⚠️ Railway free tier: 500 giờ/tháng (đủ dùng)
- ⚠️ Render free tier: Sleep sau 15 phút không dùng

---

## 🔧 BƯỚC 1: Chuyển Database từ SQL Server → PostgreSQL

### **1.1. Cài đặt Npgsql cho .NET:**

```bash
cd Backend/QuanLyKhamBenhAPI
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0
```

### **1.2. Sửa Program.cs:**

**Tìm:**

```csharp
builder.Services.AddDbContext<QuanLyKhamBenhContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

**Đổi thành:**

```csharp
builder.Services.AddDbContext<QuanLyKhamBenhContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (connectionString.Contains("postgres") || connectionString.Contains("Host="))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});
```

### **1.3. Sửa appsettings.json:**

**Thêm connection string PostgreSQL:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=QuanLyKhamBenh;Trusted_Connection=True;",
    "PostgreSQL": "Host=localhost;Port=5432;Database=QuanLyKhamBenh;Username=postgres;Password=yourpassword"
  }
}
```

### **1.4. Tạo migration mới cho PostgreSQL:**

```bash
# Xóa migrations cũ (nếu muốn clean start)
rm -r Migrations

# Tạo migration mới
dotnet ef migrations add InitialPostgreSQL --context QuanLyKhamBenhContext

# Test migration local (cần cài PostgreSQL trước)
dotnet ef database update
```

---

## 🌐 BƯỚC 2: Deploy Backend lên Railway.app

### **2.1. Chuẩn bị:**

1. Tạo tài khoản tại https://railway.app (đăng nhập bằng GitHub)
2. Push code lên GitHub repository

### **2.2. Deploy Backend:**

**Trên Railway Dashboard:**

1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Chọn repository `DatLichPhongKham`
3. Root Directory: `Backend/QuanLyKhamBenhAPI`
4. Railway tự detect .NET project

**Environment Variables cần thêm:**

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=[Railway sẽ tự động inject]
Jwt__Secret=PhongKhamDaKhoa_2025_ProductionKey_ChangeThis_32CharactersLong
Gemini__ApiKey=AIzaSyCvJkW48njUPKV1-yyLN9hkvUjgG8s9XZ8
PayOS__ClientId=bfb9f5a5-41e2-4dd8-a265-374bd53d75a3
PayOS__ApiKey=77b00e9f-ba06-4fd8-a738-069abee19407
PayOS__ChecksumKey=12beaa2a0fe64a5bcb1843ad0494738b406bbe0d2c67cafeda1d066c6d278d50
Casso__ClientId=bfb9f5a5-41e2-4dd8-a265-374bd53d75a3
Casso__ApiKey=77b00e9f-ba06-4fd8-a738-069abee19407
Casso__ChecksumKey=12beaa2a0fe64a5bcb1843ad0494738b406bbe0d2c67cafeda1d066c6d278d50
Casso__BankCode=970422
Casso__BankName=MB Bank
Casso__AccountNumber=0977135812
Casso__AccountName=DO HOANG THANH
```

### **2.3. Thêm PostgreSQL Database:**

1. Trong Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway tự động inject connection string vào biến môi trường
3. Copy DATABASE_URL (format: `postgresql://user:pass@host:port/dbname`)

### **2.4. Update CORS:**

**Sau khi có domain Railway (vd: `https://your-app.railway.app`):**

Sửa `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5265",
            "http://localhost:3000",
            "https://your-vercel-domain.vercel.app"  // Thêm domain Vercel
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### **2.5. Run Migration trên Railway:**

**Trong Railway Terminal:**

```bash
dotnet ef database update
```

**Hoặc thêm vào railway.json:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "dotnet ef database update && dotnet QuanLyKhamBenhAPI.dll",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 🎨 BƯỚC 3: Deploy Frontend lên Vercel

### **3.1. Chuẩn bị:**

1. Tạo tài khoản tại https://vercel.com (đăng nhập bằng GitHub)

### **3.2. Sửa API URL:**

**File: `FrontendWeb/services/api.ts`**

Tìm:

```typescript
const API_BASE_URL = "http://localhost:5129/api";
```

Đổi thành:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5129/api";
```

### **3.3. Deploy trên Vercel:**

**Option A: Qua Vercel Dashboard**

1. Click **"Add New Project"**
2. Import `DatLichPhongKham` repository
3. Root Directory: `FrontendWeb`
4. Framework Preset: **Next.js**
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
6. Click **Deploy**

**Option B: Qua CLI**

```bash
cd FrontendWeb
npm install -g vercel
vercel login
vercel --prod
```

### **3.4. Cập nhật CORS Backend:**

Sau khi có domain Vercel (vd: `https://phongkham.vercel.app`), quay lại Railway:

- Thêm domain Vercel vào CORS (như bước 2.4)
- Redeploy backend

---

## 🔐 BƯỚC 4: Cấu hình Production

### **4.1. JWT Secret mạnh hơn:**

Generate secret key mới:

```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Update trong Railway Environment Variables

### **4.2. Database Backup:**

**Trên Railway Dashboard:**

- PostgreSQL → Settings → Enable Automated Backups

### **4.3. Custom Domain (Optional - Free):**

**Railway:**

- Settings → Domains → Add custom domain
- Cập nhật DNS: CNAME → `your-app.railway.app`

**Vercel:**

- Settings → Domains → Add domain
- Cập nhật DNS: CNAME → `cname.vercel-dns.com`

---

## 📊 BƯỚC 5: Cập nhật Webhook URLs

### **5.1. PayOS Webhook:**

1. Đăng nhập https://my.payos.vn
2. Cài đặt → Webhook
3. URL: `https://your-backend.railway.app/api/payment/payos-webhook`

### **5.2. Casso Webhook (nếu dùng):**

1. Đăng nhập https://app.casso.vn
2. Cài đặt → Webhook
3. URL: `https://your-backend.railway.app/api/payment/casso-webhook`

---

## ✅ BƯỚC 6: Test Production

### **Checklist:**

- [ ] Frontend load được từ Vercel
- [ ] Đăng nhập hoạt động
- [ ] Tạo appointment mới
- [ ] Tạo payment → Hiển thị QR code
- [ ] Admin login
- [ ] Admin xác nhận payment thủ công
- [ ] Chatbot hoạt động

---

## 🔄 Workflow Update sau này

### **Khi sửa code:**

**Frontend:**

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel tự động deploy sau vài giây
```

**Backend:**

```bash
git add .
git commit -m "Update API"
git push origin main
# Railway tự động deploy sau 1-2 phút
```

### **Khi thay đổi Database:**

```bash
# Local
dotnet ef migrations add TenMigration
git add .
git commit -m "Add migration"
git push

# Railway Terminal
dotnet ef database update
```

---

## 📝 Thông tin Production

### **URLs:**

- **Frontend**: https://[your-project].vercel.app
- **Backend API**: https://[your-project].railway.app
- **Database**: PostgreSQL on Railway (tự động quản lý)

### **Admin Account:**

- URL: https://[your-project].vercel.app/admin
- Username: (admin account từ database seed)
- Password: (password đã hash)

### **Monitoring:**

- **Railway**: Dashboard → Metrics (CPU, RAM, Network)
- **Vercel**: Analytics → Performance

### **Logs:**

- **Railway**: Deployments → View Logs
- **Vercel**: Deployments → Function Logs

---

## ⚠️ Lưu ý quan trọng

1. **Free Tier Limits:**

   - Railway: 500 giờ/tháng (~16 giờ/ngày)
   - Render: Sleep sau 15 phút inactive
   - Vercel: 100GB bandwidth/tháng

2. **Database:**

   - Railway PostgreSQL: 512MB storage free
   - Backup thường xuyên (export SQL)

3. **Security:**

   - Không commit API keys vào Git
   - Dùng Environment Variables
   - HTTPS tự động (Railway + Vercel)

4. **Performance:**
   - Cold start có thể chậm (5-10s lần đầu)
   - Cache static assets
   - Optimize images

---

## 🆘 Troubleshooting

### **Backend không start:**

- Check Railway logs
- Verify connection string
- Check .NET version (cần .NET 8)

### **Frontend không connect Backend:**

- Verify `NEXT_PUBLIC_API_URL`
- Check CORS settings
- Test API trực tiếp: `https://your-backend.railway.app/api/`

### **Database connection failed:**

- Verify PostgreSQL running trên Railway
- Check connection string format
- Run migrations: `dotnet ef database update`

### **PayOS webhook không hoạt động:**

- Verify webhook URL public
- Check PayOS dashboard logs
- Test endpoint: `POST https://your-backend.railway.app/api/payment/payos-webhook`

---

## 📞 Support

**Railway Support**: https://railway.app/help
**Vercel Support**: https://vercel.com/support
**PostgreSQL Docs**: https://www.postgresql.org/docs/
