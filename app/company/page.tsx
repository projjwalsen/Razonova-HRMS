"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        router.push("/company/dashboard");
      }
    }
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a8f]"></div>
    </div>
  );
}