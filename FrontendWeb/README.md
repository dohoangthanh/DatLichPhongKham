# Phòng Khám Đa Khoa - Frontend

Frontend website cho hệ thống quản lý phòng khám đa khoa, được xây dựng bằng Next.js 14 và TypeScript.

## Yêu cầu hệ thống

- Node.js 18.x trở lên
- npm hoặc yarn

## Cài đặt

1. Di chuyển vào thư mục FrontendWeb:
```bash
cd FrontendWeb
```

2. Cài đặt các dependencies:
```bash
npm install
```

## Chạy ứng dụng

### Chế độ development
```bash
npm run dev
```

Website sẽ chạy tại: http://localhost:5265

### Build cho production
```bash
npm run build
npm start
```

## Cấu trúc thư mục

```
FrontendWeb/
├── app/                    # App router của Next.js 14
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Trang chủ
│   └── globals.css        # CSS toàn cục
├── components/            # Các React components
│   ├── Header.tsx         # Header với logo, search, contact
│   ├── Navigation.tsx     # Menu navigation
│   ├── HeroSection.tsx    # Banner hero section
│   ├── DepartmentsSection.tsx  # Phần giới thiệu các khoa
│   ├── PricingTable.tsx   # Bảng giá dịch vụ
│   ├── CTAButtons.tsx     # Call-to-action buttons
│   └── Footer.tsx         # Footer với thông tin liên hệ
├── public/                # Thư mục chứa static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Công nghệ sử dụng

- **Next.js 14**: React framework với App Router
- **TypeScript**: Typed superset của JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: UI library

## Tính năng

- ✅ Responsive design
- ✅ Server-side rendering với Next.js
- ✅ Type-safe với TypeScript
- ✅ Modern UI với Tailwind CSS
- ✅ Component-based architecture

## Các trang và chức năng

### Trang chủ
- Header với logo, tìm kiếm, thông tin liên hệ
- Navigation menu
- Hero section với banner
- Giới thiệu 3 khoa: Nội, Ngoại, Sản
- Bảng giá dịch vụ chi tiết
- 3 buttons CTA: Đặt lịch khám, Tra cứu kết quả, Bảng giá
- Footer với đầy đủ thông tin liên hệ

## Phát triển tiếp

Để thêm các trang mới, tạo file trong thư mục `app/`:
- `app/about/page.tsx` - Trang giới thiệu
- `app/services/page.tsx` - Trang dịch vụ
- `app/doctors/page.tsx` - Trang bác sĩ
- `app/booking/page.tsx` - Trang đặt lịch khám
- etc.

## License

Private - Dự án nội bộ
