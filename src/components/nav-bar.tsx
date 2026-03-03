"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Table, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Főoldal", icon: Home },
  { href: "/table-report", label: "Táblázat", icon: Table },
  { href: "/chart-report", label: "Grafikonok", icon: BarChart3 },
  { href: "/entries", label: "Admin", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: top nav bar */}
      <nav className="hidden md:flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-primary">
          🤰 Terhességkövető
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-card py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
