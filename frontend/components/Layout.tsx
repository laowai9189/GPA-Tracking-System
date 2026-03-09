import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/grades", label: "Grade Entry" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="font-bold text-lg text-gray-900">GPA Tracker</span>
            </div>
            <nav className="flex gap-1">
              {navItems.map(({ href, label }) => {
                const isActive =
                  href === "/"
                    ? router.pathname === "/"
                    : router.pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        GPA Tracking System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
