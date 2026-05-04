"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forgotPassword, verifyOtp, resetPassword } from "@/store/actions/authActions";
import { clearError, clearForgotState } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const {
    forgotEmail,
    otpSent,
    otpVerified,
    forgotLoading,
    otpLoading,
    resetLoading,
    forgotError,
    otpError,
    resetError,
    forgotSuccess,
    otpSuccess,
    resetSuccess,
  } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearForgotState());
  }, [dispatch]);

  useEffect(() => {
    if (otpSent) {
      setClientError(null);
    }
  }, [otpSent]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setClientError("Please enter your email.");
      return;
    }

    setClientError(null);
    await dispatch(forgotPassword({ email }));
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setClientError("Please enter the OTP sent to your email.");
      return;
    }

    setClientError(null);
    await dispatch(verifyOtp({ email: forgotEmail || email, otp }));
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setClientError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    setClientError(null);
    await dispatch(
      resetPassword({
        email: forgotEmail || email,
        otp,
        newPassword,
        confirmPassword,
      })
    );
  };

  const isProcessing = forgotLoading || otpLoading || resetLoading;
  const step = otpVerified ? "reset" : otpSent ? "otp" : "email";

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-50 font-poppins">
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/Logo.svg" alt="Logo" width={70} height={10} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden sm:inline">Remembered your password?</span>
            <Link
              href="/login"
              className="text-[#1a3a8f] font-bold tracking-widest text-xs uppercase border border-[#1a3a8f] px-4 py-1.5 rounded transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl p-8 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[48%] flex flex-col justify-center">
            <div className="mb-6">
              <p className="text-sm font-montserrat text-[#0445AD]">Password recovery</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-900">
                Recover access to your account.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Follow the steps below to receive a one-time passcode and reset your password securely.
              </p>
            </div>

            <div className="space-y-5">
              {forgotSuccess && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {forgotSuccess}
                </div>
              )}
              {otpSuccess && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {otpSuccess}
                </div>
              )}
              {resetSuccess && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {resetSuccess} You can now <Link href="/login" className="font-semibold text-[#0445AD]">login</Link> with your new password.
                </div>
              )}
              {(forgotError || otpError || resetError || clientError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {clientError || forgotError || otpError || resetError}
                </div>
              )}

              <div className="grid gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Email address <span className="text-[#1a3a8f]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={otpSent || otpVerified}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition disabled:bg-slate-100"
                  />
                </div>

                {step !== "email" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Verification code <span className="text-[#1a3a8f]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      readOnly={otpVerified}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition disabled:bg-slate-100"
                    />
                  </div>
                )}

                {step === "reset" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        New password <span className="text-[#1a3a8f]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Confirm password <span className="text-[#1a3a8f]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={
                    step === "email"
                      ? handleSendOtp
                      : step === "otp"
                      ? handleVerifyOtp
                      : handleResetPassword
                  }
                  disabled={isProcessing || Boolean(resetSuccess)}
                  className="w-full bg-[#0445AD] text-white font-bold tracking-widest text-sm uppercase py-4 rounded-2xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? "Processing..."
                    : step === "email"
                    ? "Send OTP"
                    : step === "otp"
                    ? "Verify OTP"
                    : "Reset Password"}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:w-[48%] items-center justify-center">
            <div className="relative w-full h-[420px] rounded-[32px] overflow-hidden bg-slate-100">
              <Image
                src="/auth/login.svg"
                alt="Access recovery illustration"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
