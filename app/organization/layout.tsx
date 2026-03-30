"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/org/Sidebar";
import { usePathname } from "next/navigation";

const getActiveIdFromPath = (pathname: string): string => {
  if (pathname === "/organization") return "details";
  if (pathname.includes("/settings")) return "policy";
  if (pathname.includes("/structure")) return "structure";
  if (pathname.includes("/locations")) return "locations";
  if (pathname.includes("/departments")) return "departments";
  if (pathname.includes("/designations")) return "designations";
  if (pathname.includes("/domains")) return "domains";
  if (pathname.includes("/from-addresses")) return "from-addresses";
  if (pathname.includes("/email-auth")) return "email-auth";
  return "details";
};

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeId = getActiveIdFromPath(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f3f8] font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={activeId} />
        <main className="flex-1 bg-[#f0f3f8] min-h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
