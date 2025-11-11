import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phòng Khám Đa Khoa - MEDLATEC',
  description: 'Hệ thống quản lý phòng khám đa khoa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
