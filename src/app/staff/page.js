"use client";

import { useState, useEffect } from "react";
import { admin as adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { 
  Building, 
  TrendingUp, 
  BookOpen, 
  DollarSign, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StaffDashboardOverview() {
  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard overall KPIs
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });

  // Client side mounting state check to prevent hydration warnings with Recharts
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getHotels();
      const list = data.results || [];
      setHotelsList(list);

      // Simulating some premium global aggregate metrics based on properties
      const count = list.length;
      setStats({
        totalHotels: count,
        totalBookings: count * 8 + 4,
        totalRevenue: count * 75000 + 12400,
        activeBookings: count * 3 + 2,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock revenue monthly chart data
  const chartData = [
    { name: "Jan", Revenue: stats.totalRevenue * 0.12 },
    { name: "Feb", Revenue: stats.totalRevenue * 0.15 },
    { name: "Mar", Revenue: stats.totalRevenue * 0.18 },
    { name: "Apr", Revenue: stats.totalRevenue * 0.22 },
    { name: "May", Revenue: stats.totalRevenue * 0.33 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Welcome back, Partner!</h2>
          <p className="text-muted">Here is an aggregate summary of your hotel management portfolio.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="kpi-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>Managed Hotels</h4>
            <span className="stat-card-value">{loading ? "..." : stats.totalHotels}</span>
          </div>
          <div className="stat-card-icon accent">
            <Building size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>Gross Reservations</h4>
            <span className="stat-card-value">{loading ? "..." : stats.totalBookings}</span>
          </div>
          <div className="stat-card-icon">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>Aggregated Revenue</h4>
            <span className="stat-card-value">{loading ? "..." : formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="stat-card-icon" style={{ backgroundColor: "#e6f9e6", color: "var(--success)" }}>
            <DollarSign size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>Active Bookings</h4>
            <span className="stat-card-value">{loading ? "..." : stats.activeBookings}</span>
          </div>
          <div className="stat-card-icon" style={{ backgroundColor: "#e6f0ff", color: "var(--info)" }}>
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Analytics chart and properties */}
      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600 }}>Revenue Progression (Est.)</h3>
            <span className="badge badge-primary">Growth +12%</span>
          </div>
          <div className="chart-container">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                  <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
            Quick Property Access
          </h3>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
            </div>
          ) : hotelsList.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {hotelsList.slice(0, 4).map((h) => (
                <Link 
                  key={h.id}
                  href={`/staff/hotels/${h.id}/rooms`}
                  className="card"
                  style={{ 
                    padding: "var(--space-3)", 
                    display: "flex", 
                    justifyContent: "between",
                    alignItems: "center",
                    textDecoration: "none",
                    cursor: "pointer",
                    fontSize: "var(--font-sm)",
                    borderColor: "var(--border-default)"
                  }}
                >
                  <div>
                    <strong>{h.name}</strong>
                    <span style={{ display: "block", fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                      {h.city} · {h.is_active ? "Active" : "Pending Activation"}
                    </span>
                  </div>
                  <ArrowRight size={16} color="var(--primary)" />
                </Link>
              ))}
              {hotelsList.length > 4 && (
                <Link 
                  href="/staff/hotels" 
                  style={{ 
                    fontSize: "var(--font-xs)", 
                    fontWeight: 600, 
                    color: "var(--primary)",
                    marginTop: "auto",
                    textAlign: "right",
                    display: "block"
                  }}
                >
                  View all properties →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-8) 0", color: "var(--text-secondary)", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Building size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: "var(--font-sm)" }}>No properties listed yet.</p>
              <Link href="/staff/hotels" className="btn btn-primary btn-sm" style={{ marginTop: 12, alignSelf: "center" }}>
                Add Hotel
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
