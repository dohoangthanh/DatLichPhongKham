'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Checking username:', username);
      const response = await fetch(`${API_URL}/ForgotPassword/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy tài khoản');
        return;
      }

      if (!data.hasPhone) {
        setError('Tài khoản chưa cập nhật số điện thoại. Vui lòng liên hệ admin.');
        return;
      }

      setPhone(data.phone);
      setStep(2);
      await handleSendOtp();
    } catch (err) {
      console.error('Error checking username:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/ForgotPassword/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, contactMethod: 'phone' })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không thể gửi mã xác thực');
        return;
      }

      console.log('OTP sent successfully. Check server console for OTP code.');
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi mã xác thực');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ForgotPassword/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không thể đặt lại mật khẩu');
        return;
      }

      setStep(4);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Logo Phòng Khám" 
              width={150} 
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Quên mật khẩu
              </h1>
              <p className="text-gray-600">
                {step === 1 && 'Nhập tên đăng nhập của bạn'}
                {step === 2 && 'Nhập mã xác thực đã gửi đến số điện thoại'}
                {step === 3 && 'Đặt mật khẩu mới'}
                {step === 4 && 'Đặt lại mật khẩu thành công'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleCheckUsername}>
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              </form>
            )}

            {(step === 2 || step === 3) && (
              <form onSubmit={handleResetPassword}>
                {phone && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Mã xác thực đã được gửi đến số điện thoại: <strong>{phone}</strong>
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã xác thực (OTP)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full text-blue-600 hover:text-blue-700 py-2 font-medium"
                >
                  Gửi lại mã xác thực
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ?{' '}
              <a href="tel:1900-xxxx" className="text-blue-600 hover:text-blue-700 font-medium">
                Gọi hotline: 1900-xxxx
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 Phòng Khám. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
