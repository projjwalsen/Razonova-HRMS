"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

const Header = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Logo" width={150} height={32} />
        </div>

        {/* Nav right */}
        <div className="flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-[#1a3a8f] font-bold tracking-widest text-xs uppercase border border-[#1a3a8f] px-4 py-1.5 rounded hover:bg-[#1a3a8f] hover:text-white transition-colors duration-200"
            >
              Logout
            </button>
          ) : (
            <>
              <span className="text-gray-500 hidden sm:inline">
                Have a Razonova account?
              </span>
              <Link
                href="/login"
                className="text-[#1a3a8f] font-bold tracking-widest text-xs uppercase border border-[#1a3a8f] px-4 py-1.5 rounded hover:bg-[#1a3a8f] hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
