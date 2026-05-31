"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookings as bookingsApi, users as usersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, getNights, formatDateISO } from "@/lib/utils";
import { Check, ChevronRight, CreditCard, Users, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const hotelId = searchParams.get("hotelId");
  const roomId = searchParams.get("roomId");
  const hotelName = searchParams.get("hotelName") || "Hotel";
  const roomType = searchParams.get("roomType") || "Room";
  const basePrice = parseFloat(searchParams.get("basePrice") || "0");

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = formatDateISO(new Date());
  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : 0;
  const estimatedTotal = nights * basePrice;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Step 1: Reserve
  const handleReserve = async () => {
    if (!checkIn || !checkOut) { toast.error("Select dates"); return; }
    if (nights < 1) { toast.error("Check-out must be after check-in"); return; }
    setLoading(true);
    try {
      const { data } = await bookingsApi.init({
        room_id: parseInt(roomId),
        check_in_date: checkIn,
        checkout_date: checkOut,
      });
      setBooking(data.booking);
      toast.success("Room reserved! Proceed to payment.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Reservation failed");
    } finally { setLoading(false); }
  };

  // Step 2: Pay (mock direct confirmation)
  const handlePay = async () => {
    setLoading(true);
    try {
      await bookingsApi.startPayment(booking.id);
      toast.success("Payment confirmed successfully!");
      router.push(`/booking/success?bookingId=${booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Select Dates", "Payment"];

  if (authLoading) return null;

  return (
    <div className="booking-page">
      <div className="container">
        {/* Steps indicator */}
        <div className="booking-steps">
          {stepLabels.map((label, i) => (
            <div key={label} style={{ display: "contents" }}>
              <div className={`booking-step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "completed" : ""}`}>
                <div className="booking-step-number">
                  {step > i + 1 ? <Check size={14} /> : i + 1}
                </div>
                <span>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div className="booking-step-divider" />}
            </div>
          ))}
        </div>

        <div className="booking-card">
          {/* Hotel/Room Info */}
          <div className="booking-summary">
            <h4 style={{ marginBottom: "var(--space-3)" }}>{hotelName}</h4>
            <div className="booking-summary-row"><span>Room Type</span><span>{roomType}</span></div>
            <div className="booking-summary-row"><span>Base Price</span><span>{formatCurrency(basePrice)} / night</span></div>
            {booking && (
              <>
                <div className="booking-summary-row"><span>Check-in</span><span>{formatDate(booking.check_in_date)}</span></div>
                <div className="booking-summary-row"><span>Check-out</span><span>{formatDate(booking.checkout_date)}</span></div>
                <div className="booking-summary-row"><span>Nights</span><span>{getNights(booking.check_in_date, booking.checkout_date)}</span></div>
                <div className="booking-summary-total"><span>Total</span><span>{formatCurrency(booking.total_price)}</span></div>
              </>
            )}
            {!booking && nights > 0 && (
              <div className="booking-summary-total"><span>Estimated Total</span><span>{formatCurrency(estimatedTotal)}</span></div>
            )}
          </div>

          {/* Step 1: Dates */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: "var(--space-4)" }}><CalendarDays size={20} style={{ display: "inline", verticalAlign: "middle" }} /> Select Your Dates</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <input className="form-input" type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <input className="form-input" type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
                <button className="btn btn-primary btn-lg" onClick={handleReserve} disabled={loading}>
                  {loading ? "Reserving..." : "Reserve Room"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment (Mock) */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: "var(--space-4)" }}><CreditCard size={20} style={{ display: "inline", verticalAlign: "middle" }} /> Payment</h3>
              <div style={{ background: "var(--surface-soft)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", marginBottom: "var(--space-6)", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>Test Mode — Stripe checkout is simulated</p>
                <p style={{ fontSize: "var(--font-3xl)", fontWeight: 700 }}>{formatCurrency(booking?.total_price)}</p>
              </div>
              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button className={`btn btn-primary btn-lg ${loading ? "btn-loading" : ""}`} onClick={handlePay} disabled={loading}>
                  {loading ? "" : "Pay Now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{padding:"80px 0",textAlign:"center"}}>Loading...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
