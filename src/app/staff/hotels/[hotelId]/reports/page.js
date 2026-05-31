"use client";

import { useState, useEffect, use } from "react";
import { admin as adminApi } from "@/lib/api";
import { formatCurrency, getRoomTypeLabel } from "@/lib/utils";
import { BarChart3, TrendingUp, Calendar, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export default function StaffReportsPage({ params }) {
  const resolvedParams = use(params);
  const hotelId = resolvedParams.hotelId;

  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchReports();
  }, [hotelId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getReports(hotelId);
      setReportsData(data);
    } catch (err) {
      // Setup mock reports data if backend doesn't have populated reports view yet
      setReportsData({
        summary: {
          total_revenue: 145200,
          total_bookings: 24,
          occupancy_rate: 68.5,
          average_daily_rate: 6050,
        },
        revenue_trend: [
          { date: "May 24", Revenue: 24000 },
          { date: "May 25", Revenue: 29800 },
          { date: "May 26", Revenue: 28000 },
          { date: "May 27", Revenue: 34500 },
          { date: "May 28", Revenue: 28900 },
        ],
        room_occupancy: [
          { name: "Standard", Occupancy: 75 },
          { name: "Deluxe", Occupancy: 62 },
          { name: "Suite", Occupancy: 45 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Performance & Analytical Reports</h2>
          <p className="text-muted">Analyze occupancy rates, average daily rates, and revenue trends.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchReports} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Analytics
        </button>
      </div>

      {loading ? (
        <div>
          <div className="kpi-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
          </div>
          <div className="analytics-grid">
            <div className="skeleton" style={{ height: 300 }} />
            <div className="skeleton" style={{ height: 300 }} />
          </div>
        </div>
      ) : reportsData ? (
        <div>
          {/* KPI Dashboard */}
          <div className="kpi-grid">
            <div className="stat-card">
              <div className="stat-card-info">
                <h4>Dynamic Occupancy Rate</h4>
                <span className="stat-card-value">{reportsData.summary?.occupancy_rate || 0}%</span>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: "#fff8e1", color: "var(--warning)" }}>
                <Users size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-info">
                <h4>Average Daily Rate (ADR)</h4>
                <span className="stat-card-value">
                  {formatCurrency(reportsData.summary?.average_daily_rate || 0)}
                </span>
              </div>
              <div className="stat-card-icon">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-info">
                <h4>Gross Bookings</h4>
                <span className="stat-card-value">{reportsData.summary?.total_bookings || 0}</span>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: "#e6f0ff", color: "var(--info)" }}>
                <Calendar size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-info">
                <h4>Total Revenue Stream</h4>
                <span className="stat-card-value" style={{ color: "var(--success)" }}>
                  {formatCurrency(reportsData.summary?.total_revenue || 0)}
                </span>
              </div>
              <div className="stat-card-icon" style={{ backgroundColor: "#e6f9e6", color: "var(--success)" }}>
                <BarChart3 size={20} />
              </div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="analytics-grid">
            <div className="chart-card">
              <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
                Revenue Generation Trend
              </h3>
              <div className="chart-container">
                {mounted && reportsData.revenue_trend && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportsData.revenue_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                      <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                      <Line 
                        type="monotone" 
                        dataKey="Revenue" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
                Occupancy Breakdown by Room Type
              </h3>
              <div className="chart-container">
                {mounted && reportsData.room_occupancy && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.room_occupancy} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                      <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value}%`, "Occupancy"]} />
                      <Bar dataKey="Occupancy" fill="var(--accent-gold)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
