"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, ChevronDown } from "lucide-react";

const Header = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; roles?: string[] }>({});
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  const isLoggedIn = !!user.name || !!user.email;

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    router.push("/login");
  };

  return (
    <header className="w-full bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-99">
      <div className="w-full bg-white px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/Logo.svg" alt="Logo" width={70} height={10} />
        </div>

        {/* Nav right */}
        <div className="flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 bg-[#0445AD]/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#0445AD]" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">
                    {user.name || "User"}
                  </p>
                  
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {user.roles && user.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {user.roles.slice(0, 2).map((role) => (
                            <span
                              key={role}
                              className="px-1.5 py-0.5 bg-[#0445AD]/10 text-[#0445AD] rounded text-[10px] font-semibold uppercase"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Bell className="w-4 h-4 text-gray-400" />
                        Notifications
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
