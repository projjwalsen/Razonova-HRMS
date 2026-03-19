'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.from('.login-form', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    router.push('/admin');
  };

  return (
    <>
      
      <main className="min-h-screen flex items-center justify-center py-32 px-4">
        <div className="w-full max-w-md">
          <div ref={formRef} className="login-form">
            {/* Header */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
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
                    className="text-sm font-semibold text-black hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-semibold text-black hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Having trouble signing in?
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold text-black hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
