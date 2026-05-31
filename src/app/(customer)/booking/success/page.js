"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="success-page">
      <div className="success-icon"><CheckCircle size={40} /></div>
      <h1>Booking Confirmed!</h1>
      <p>Your booking {bookingId ? `#${bookingId}` : ""} has been successfully confirmed. You will receive a confirmation email shortly.</p>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
        <Link href="/bookings" className="btn btn-primary btn-lg">View My Bookings</Link>
        <Link href="/" className="btn btn-outline btn-lg">Back to Home</Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return <Suspense fallback={<div style={{padding:"80px 0",textAlign:"center"}}>Loading...</div>}><SuccessContent /></Suspense>;
}
