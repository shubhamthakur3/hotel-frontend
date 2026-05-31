"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { users as usersApi, bookings as bookingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, getStatusInfo } from "@/lib/utils";
import { BookOpen, Calendar, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function MyBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push("/auth/login"); return; }
    if (!isAuthenticated) return;
    const fetchBookings = async () => {
      try {
        const { data } = await usersApi.getMyBookings();
        setBookingsList(data.results || []);
      } catch { setBookingsList([]); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, [isAuthenticated, authLoading, router]);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsApi.cancel(id);
      toast.success("Booking cancelled");
      setBookingsList((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" } : b));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to cancel");
    }
  };

  if (authLoading) return null;

  return (
    <div className="bookings-page">
      <div className="container">
        <h1 style={{ marginBottom: "var(--space-6)" }}>My Bookings</h1>

        {loading ? (
          <div className="bookings-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-card" style={{ height: 100 }} />
            ))}
          </div>
        ) : bookingsList.length > 0 ? (
          <div className="bookings-list">
            {bookingsList.map((b) => {
              const status = getStatusInfo(b.status);
              const canCancel = ["RESERVED", "GUESTS_ADDED", "PAYMENTS_PENDING", "CONFIRMED"].includes(b.status);
              return (
                <div key={b.id} className="booking-item">
                  <div>
                    <div className="booking-item-header">
                      <strong>#{b.id} — {b.hotel_name}</strong>
                      <span className={`badge ${status.className}`}>{status.label}</span>
                    </div>
                    <p className="booking-item-dates">
                      <Calendar size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      {formatDate(b.check_in_date)} → {formatDate(b.checkout_date)}
                      {b.room_type && <> · {b.room_type}</>}
                    </p>
                  </div>
                  <div className="booking-item-actions">
                    <span className="booking-item-price">{formatCurrency(b.total_price)}</span>
                    {canCancel && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleCancel(b.id)}>
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen size={48} /></div>
            <h3>No bookings yet</h3>
            <p>Start exploring hotels and make your first reservation!</p>
            <button className="btn btn-primary" onClick={() => router.push("/search")}>Explore Hotels</button>
          </div>
        )}
      </div>
    </div>
  );
}
