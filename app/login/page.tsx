"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, clearError } from "@/store/actions/authActions";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/organization");
      }
    }
  }, [router]);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      const userData = result.payload?.data;
      const roles = (userData as any)?.roles || [];

      // Check user role and redirect accordingly
      if (roles.includes("COMPANY_ADMIN")) {
        router.push("/organization");
      } else if (roles.includes("EMPLOYEE")) {
        router.push("/employee");
      } else {
        router.push("/organization");
      }
    }
  };

  return (
    <div className="min-h-screen  flex flex-col w-full">
      {/* ── HEADER ── */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className=" px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={150} height={20} />

          </div>

          {/* Nav right */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden sm:inline">Do not have a Razonova account?</span>
            <a
              href="/signup"
              className="text-[#1a3a8f] font-bold tracking-widest text-xs uppercase border border-[#1a3a8f] px-4 py-1.5 rounded transition-colors duration-200"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1  flex items-center justify-center px-4 py-10">
        <div className="w-full p-8 bg-white min-h-fit max-w-7xl gap-4 rounded-lg overflow-hidden flex flex-col lg:flex-row justify-center items-center">

          {/* ── LEFT: FORM PANEL ── */}
          <div className="w-full lg:w-[50%] flex flex-col justify-center">
            {/* Mini brand */}
            <div className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="Logo" width={200} height={34} className="rounded-sm" />

            </div>

            <h1 className="text-xl font-extrabold text-gray-900 mb-1 tracking-tight mb-7">
              Welcome Back
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">
                  Email ID <span className="text-[#1a3a8f]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">
                  Password <span className="text-[#1a3a8f]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <a href="#" className="text-sm text-[#1a3a8f] font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#0445AD] text-white font-bold tracking-widest text-sm uppercase py-4 rounded-sm transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login Now"}
              </button>
            </div>

            {/* Social login */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-300 text-xs uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              {/* LinkedIn */}
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5C.02 2.12 1.13 1 2.5 1S4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zm6.5 0h3.8v2.13h.05c.53-1 1.83-2.13 3.77-2.13 4.03 0 4.78 2.65 4.78 6.1V24h-4v-8.7c0-2.08-.04-4.75-2.9-4.75-2.9 0-3.34 2.27-3.34 4.6V24H7V8.5z" />
                </svg>
              </button>
              {/* Google */}
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
              {/* Twitter */}
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>
              {/* Facebook */}
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </button>
            </div>
            <span className="text-xs text-[#434343] mt-3">Don’t have a Razonova account? <Link href='/signup'><span className="text-[#0445AD] font-semibold">SIGN UP</span></Link> </span>
          </div>

          {/* ── RIGHT: IMAGE PANEL ── */}
          <div className="hidden lg:flex lg:w-[45%] relative items-stretch">

            {/* Placeholder image — swap src with real image */}
            <div className="relative w-full h-full  overflow-hidden">
              <Image
                src="/auth/login.svg"
                alt="Professionals collaborating"
                width={100}
                height={100}

                className="w-full h-full object-cover object-center"
              />

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
