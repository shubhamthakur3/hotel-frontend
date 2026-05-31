"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function BookingCancelPage() {
  return (
    <div className="success-page">
      <div className="success-icon" style={{ background: "#ffeae6", color: "var(--danger)" }}>
        <XCircle size={40} />
      </div>
      <h1>Payment Cancelled</h1>
      <p>Your payment was not completed. Your reservation is still held temporarily — you can retry the payment.</p>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
        <Link href="/bookings" className="btn btn-primary btn-lg">My Bookings</Link>
        <Link href="/" className="btn btn-outline btn-lg">Browse Hotels</Link>
      </div>
    </div>
  );
}
