"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
    { label: "Organization Details", id: "details", href: "/organization" },
    { label: "Organization Settings", id: "policy", href: "/organization/settings" },
    { label: "Departments", id: "departments", href: "/organization/departments" },
    { label: "Designations", id: "designations", href: "/organization/designations" },
    { label: "Roles & Permissions", id: "roles", href: "/organization/roles" },
    { label: "Permissions List", id: "permissions", href: "/organization/permissions" },
    { label: "Dashboard", id: "dashboard", href: "/company" },
];

interface SidebarProps {
    activeId?: string;
    onNavigate?: (id: string) => void;
}

export default function Sidebar({ activeId = "details", onNavigate }: SidebarProps) {
    const [active, setActive] = useState(activeId);

    const handleClick = (id: string) => {
        setActive(id);
        onNavigate?.(id);
    };

    return (
        <aside className="w-72 shrink-0 bg-[#E7EFF1] border-r border-gray-100 min-h-full py-3 shadow-sm">
            <nav className="flex flex-col gap-0.5 px-7 py-7">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => handleClick(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xs text-sm font-medium transition-all duration-150 no-underline ${
                            active === item.id
                                ? "bg-white text-[#1a3a8f]  pl-[10px]"
                                : "text-black hover:bg-white hover:text-gray-900 "
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
