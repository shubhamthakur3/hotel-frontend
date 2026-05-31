"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  User,
  Menu,
  X,
  LogOut,
  BookOpen,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import "./customer.css";

export default function CustomerLayout({ children }) {
  return (
    <div className="customer-layout">
      <Navbar />
      <main className="customer-main">{children}</main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2L4 10v12l12 8 12-8V10L16 2z"
              fill="var(--primary)"
              opacity="0.9"
            />
            <path
              d="M16 6l-8 5.5v9L16 26l8-5.5v-9L16 6z"
              fill="white"
              opacity="0.3"
            />
            <text
              x="16"
              y="19"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              S
            </text>
          </svg>
          <span className="navbar-logo-text">StayNest</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav">
          <Link href="/" className="navbar-link">
            Home
          </Link>
          <Link href="/search" className="navbar-link">
            Explore
          </Link>
        </nav>

        {/* Auth / Profile */}
        <div className="navbar-actions">
          {isStaff && (
            <Link href="/staff" className="btn btn-ghost btn-sm navbar-staff-btn">
              <LayoutDashboard size={16} />
              <span>Staff Panel</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="navbar-profile" ref={menuRef}>
              <button
                className="navbar-profile-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="User menu"
              >
                <Menu size={16} />
                <div className="navbar-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </button>

              {menuOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <p className="navbar-dropdown-name">{user?.name}</p>
                    <p className="navbar-dropdown-email">{user?.email}</p>
                  </div>
                  <div className="divider" style={{ margin: "8px 0" }} />
                  <Link
                    href="/profile"
                    className="navbar-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle size={16} />
                    Profile & Guests
                  </Link>
                  <Link
                    href="/bookings"
                    className="navbar-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BookOpen size={16} />
                    My Bookings
                  </Link>
                  <div className="divider" style={{ margin: "8px 0" }} />
                  <button className="navbar-dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-btns">
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div className="navbar-mobile">
          <Link href="/" onClick={() => setMobileNavOpen(false)}>
            Home
          </Link>
          <Link href="/search" onClick={() => setMobileNavOpen(false)}>
            Explore
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/bookings" onClick={() => setMobileNavOpen(false)}>
                My Bookings
              </Link>
              <Link href="/profile" onClick={() => setMobileNavOpen(false)}>
                Profile
              </Link>
              {isStaff && (
                <Link href="/staff" onClick={() => setMobileNavOpen(false)}>
                  Staff Panel
                </Link>
              )}
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileNavOpen(false)}>
                Log in
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileNavOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-heading">StayNest</h4>
            <p className="footer-text">
              Discover and book the best hotels with dynamic pricing and instant
              confirmation.
            </p>
          </div>
          <div className="footer-col">
            <h5 className="footer-heading">Explore</h5>
            <Link href="/search" className="footer-link">Search Hotels</Link>
            <Link href="/bookings" className="footer-link">My Bookings</Link>
          </div>
          <div className="footer-col">
            <h5 className="footer-heading">Support</h5>
            <span className="footer-link">Help Center</span>
            <span className="footer-link">Cancellation Policy</span>
            <span className="footer-link">Contact Us</span>
          </div>
          <div className="footer-col">
            <h5 className="footer-heading">Hosting</h5>
            <Link href="/staff" className="footer-link">Staff Dashboard</Link>
            <span className="footer-link">List Your Property</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StayNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
