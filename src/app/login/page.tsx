'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useRole } from '@/components/RoleContext';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser, setRole } = useRole();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rahti_token');
      if (token && token.startsWith('mock-jwt-token-for-')) {
        localStorage.removeItem('rahti_token');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      setError('يرجى إدخال رقم الهاتف وكلمة المرور.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.login(phoneNumber, password);
      
      // Save token to localStorage
      localStorage.setItem('rahti_token', result.token);
      
      // Save token to cookie for Edge Middleware access (7 days expiry)
      document.cookie = `rahti_token=${result.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax; Secure`;

      // Set user details in global state
      setUser(result.user);
      setRole(result.user.role);

      // Clean window navigation to completely refresh application state and role
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Golden Orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-45 -left-40 w-96 h-96 bg-[#1C2D42]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-[#D4AF37]/15 relative z-10 animate-fade-in transition-all">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1C2D42] text-white shadow-lg border border-[#D4AF37]/35 mb-4 transform hover:scale-105 transition-transform duration-300">
            <span className="font-serif text-3xl font-extrabold text-[#D4AF37]">R</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C2D42]">فنادق راحتي</h2>
          <p className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            بوابة الإدارة ونظام العمليات الموحد ERP
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-md space-y-4">
            {/* Phone Number Input */}
            <div>
              <label htmlFor="phone-number" className="block text-xs font-bold text-[#1C2D42] mb-1.5">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18.75h12" />
                  </svg>
                </div>
                <input
                  id="phone-number"
                  name="phone"
                  type="text"
                  required
                  placeholder="+96650xxxxxxx"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="appearance-none block w-full pr-11 pl-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-[#1C2D42] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1C2D42] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pr-11 pl-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-[#1C2D42] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm font-semibold transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="mr-2 block font-bold text-gray-500 cursor-pointer">
                تذكرني على هذا الجهاز
              </label>
            </div>
            
            <a href="#" className="font-bold text-[#D4AF37] hover:text-[#1C2D42] transition-colors">
              نسيت كلمة المرور؟
            </a>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1C2D42] hover:bg-[#253952] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
