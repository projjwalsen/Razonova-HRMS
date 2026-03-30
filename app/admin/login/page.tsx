'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
   
    router.push('/organization'); 
  };

  return (
    <>
      
      <main className="min-h-screen flex items-center justify-center py-32 px-4">
        <div className="w-full max-w-md">
          <div ref={formRef} className="login-form">
            {/* Header */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-['Montserrat']">H</span>
                </div>
                <span className="text-2xl font-bold font-['Montserrat']">
                  HRMS
                </span>
              </Link>
              <h1 className="text-4xl font-bold mb-4 font-['Montserrat']">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {/* Login Form */}
            <div className="p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-lg">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#0445AD] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                >
                  Sign In
                </button>
              </form>

              
            </div>

            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
