"use client";

import { useState, useEffect, use } from "react";
import { admin as adminApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusInfo } from "@/lib/utils";
import { Search, Calendar, User, FileText, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffBookingsPage({ params }) {
  const resolvedParams = use(params);
  const hotelId = resolvedParams.hotelId;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer for manual confirmation
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Form fields for manual confirmation
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [hotelId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getHotelBookings(hotelId);
      setBookings(data.results || []);
    } catch (err) {
      toast.error("Failed to load booking orders");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmationDrawer = (booking) => {
    setSelectedBooking(booking);
    setPaymentMethod("CASH");
    setPaymentReference("");
    setAdditionalNotes("");
    setShowDrawer(true);
  };

  const handleManualConfirm = async (e) => {
    e.preventDefault();
    setConfirming(true);

    try {
      await adminApi.manualConfirm(selectedBooking.id, {
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        notes: additionalNotes,
      });
      toast.success("Booking confirmed manually!");
      setShowDrawer(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to confirm booking");
    } finally {
      setConfirming(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.id.toString().includes(query) ||
      b.user_email?.toLowerCase().includes(query) ||
      b.user_name?.toLowerCase().includes(query) ||
      b.status.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Booking Orders</h2>
          <p className="text-muted">Manage guest reservations, cancellations, and manual checkout payments.</p>
        </div>
      </div>

      <div className="table-card">
        {/* Table header control search bar */}
        <div className="table-header">
          <div className="form-group" style={{ minWidth: 300, position: "relative" }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search by Booking ID, guest name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search 
              size={16} 
              className="text-muted" 
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} 
            />
          </div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
            Showing {filteredBookings.length} orders
          </span>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: "var(--space-8)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 50, marginBottom: 8 }} />
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Information</th>
                  <th>Dates & Length</th>
                  <th>Total Price</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const statusInfo = getStatusInfo(b.status);
                  const canConfirmManually = ["RESERVED", "GUESTS_ADDED", "PAYMENTS_PENDING"].includes(b.status);

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>#{b.id}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong>{b.user_name || "Guest Account"}</strong>
                          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                            {b.user_email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "var(--font-sm)" }}>
                            {formatDate(b.check_in_date)} → {formatDate(b.checkout_date)}
                          </span>
                          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                            Room: {b.room_type || `Class ID: #${b.room_id}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(b.total_price)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        {canConfirmManually ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openConfirmationDrawer(b)}
                          >
                            <CheckCircle2 size={12} /> Confirm Payment
                          </button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "var(--font-xs)" }}>
                            No actions required
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-12)" }}>
              <FileText size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
              <p>No bookings match the search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Payment Confirmation Drawer */}
      {showDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowDrawer(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>Confirm Booking Payment Manually</h3>
              <button onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualConfirm} style={{ display: "contents" }}>
              <div className="drawer-body">
                <div 
                  style={{ 
                    padding: "var(--space-4)", 
                    backgroundColor: "var(--surface-soft)", 
                    borderRadius: "var(--radius-md)", 
                    fontSize: "var(--font-sm)"
                  }}
                >
                  <p style={{ marginBottom: 4 }}>
                    <strong>Booking ID:</strong> #{selectedBooking?.id}
                  </p>
                  <p style={{ marginBottom: 4 }}>
                    <strong>Guest name:</strong> {selectedBooking?.user_name} ({selectedBooking?.user_email})
                  </p>
                  <p style={{ marginBottom: 4 }}>
                    <strong>Dates:</strong> {formatDate(selectedBooking?.check_in_date)} to {formatDate(selectedBooking?.checkout_date)}
                  </p>
                  <p style={{ fontSize: "var(--font-base)", fontWeight: 700, marginTop: 8 }}>
                    Amount Due: {formatCurrency(selectedBooking?.total_price)}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Cash Payment</option>
                    <option value="POS">Card Machine (POS / swipe)</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference ID / Slip Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. TXN987654321"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Operator Notes</label>
                  <textarea
                    className="form-input"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="e.g. Guest paid total at frontdesk reception counter"
                    rows={3}
                    style={{ fontFamily: "inherit", resize: "none" }}
                  />
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDrawer(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={confirming}>
                  {confirming ? "Confirming..." : "Record Payment & Confirm"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
