"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Hotel, 
  CalendarDays, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  ArrowLeftCircle,
  Menu,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import "@/styles/staff.css";

export default function StaffLayout({ children }) {
  const { user, isAuthenticated, isStaff, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeHotelId, setActiveHotelId] = useState(null);

  // Parse active hotel ID from path (e.g. /staff/hotels/1/rooms -> activeHotelId = 1)
  useEffect(() => {
    const match = pathname.match(/\/staff\/hotels\/(\d+)/);
    if (match && match[1]) {
      setActiveHotelId(match[1]);
    } else {
      // If we navigate away from a specific hotel sub-page, clear the active hotel context
      if (!pathname.includes("/staff/hotels/")) {
        setActiveHotelId(null);
      }
    }
  }, [pathname]);

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (!isStaff) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isStaff, isLoading, router]);

  if (isLoading || !isAuthenticated || !isStaff) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        gap: 16,
        fontFamily: "var(--font-family)",
        background: "var(--surface-soft)"
      }}>
        <div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} />
        <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Verifying authorization...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard Overview", href: "/staff", icon: <LayoutDashboard size={18} /> },
    { label: "Hotel Properties", href: "/staff/hotels", icon: <Hotel size={18} /> },
  ];

  const hotelSubNavItems = activeHotelId ? [
    { label: "Rooms & Pricing", href: `/staff/hotels/${activeHotelId}/rooms`, icon: <ChevronRight size={16} /> },
    { label: "Inventory Calendar", href: `/staff/hotels/${activeHotelId}/inventory`, icon: <CalendarDays size={16} /> },
    { label: "Booking Orders", href: `/staff/hotels/${activeHotelId}/bookings`, icon: <BookOpen size={16} /> },
    { label: "Analytical Reports", href: `/staff/hotels/${activeHotelId}/reports`, icon: <BarChart3 size={16} /> },
  ] : [];

  return (
    <div className="staff-layout">
      {/* Sidebar */}
      <aside className="staff-sidebar">
        <div className="staff-sidebar-header">
          <ShieldCheck size={24} color="var(--accent-gold)" />
          <span className="staff-sidebar-logo-text">Staff Control</span>
        </div>

        <nav className="staff-sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`staff-sidebar-item ${isActive ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Hotel Specific Subnavigation context */}
          {activeHotelId && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{ 
                padding: "0 var(--space-6)", 
                fontSize: "var(--font-xs)", 
                textTransform: "uppercase", 
                letterSpacing: 0.5, 
                color: "rgba(255,255,255,0.4)",
                fontWeight: 700,
                marginBottom: "var(--space-2)"
              }}>
                Manage Property
              </div>
              {hotelSubNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`staff-sidebar-item ${isActive ? "active" : ""}`}
                    style={{ paddingLeft: "calc(var(--space-6) + 8px)" }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="staff-sidebar-footer">
          <div className="staff-sidebar-user" style={{ marginBottom: "var(--space-2)" }}>
            <div className="staff-sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div>
              <span className="staff-sidebar-username">{user?.name}</span>
              <span className="staff-sidebar-role">
                {user?.roles?.includes("ADMIN") ? "System Admin" : "Hotel Manager"}
              </span>
            </div>
          </div>
          
          <Link href="/" className="staff-sidebar-item" style={{ borderLeft: "none" }}>
            <ArrowLeftCircle size={18} />
            <span>Customer Portal</span>
          </Link>
          
          <button 
            className="staff-sidebar-item" 
            onClick={handleLogout}
            style={{ borderLeft: "none" }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="staff-content">
        <header className="staff-header">
          <div className="staff-header-title">
            {pathname.includes("/staff/hotels/") ? "Property Management console" : "Dashboard"}
          </div>
          <div className="staff-header-actions">
            <span className="badge badge-neutral" style={{ padding: "var(--space-2) var(--space-4)" }}>
              Role: {user?.roles?.join(", ")}
            </span>
          </div>
        </header>

        <main className="staff-body">
          {children}
        </main>
      </div>
    </div>
  );
}
