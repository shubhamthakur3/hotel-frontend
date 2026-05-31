"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Sparkles, CreditCard, CheckCircle } from "lucide-react";
import { formatDateISO } from "@/lib/utils";

const DESTINATIONS = [
  { city: "Mumbai", tagline: "City of dreams", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80" },
  { city: "Delhi", tagline: "Historic capital", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80" },
  { city: "Goa", tagline: "Beach paradise", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80" },
  { city: "Jaipur", tagline: "Pink city charm", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80" },
];

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/search?${params.toString()}`);
  };

  const today = formatDateISO(new Date());

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect <span>Stay</span></h1>
          <p className="hero-subtitle">
            Discover handpicked hotels with dynamic pricing and instant booking confirmation.
          </p>

          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-field">
              <label>Where</label>
              <input
                type="text"
                placeholder="Search destinations"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Check in</label>
              <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="search-field">
              <label>Check out</label>
              <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="search-field">
              <label>Guests</label>
              <input type="number" placeholder="Guests" min="1" max="10" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </div>
            <button type="submit" className="search-btn">
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">Explore trending cities with the best hotel deals</p>
          <div className="destinations-grid">
            {DESTINATIONS.map((d) => (
              <div key={d.city} className="destination-card" onClick={() => router.push(`/search?city=${d.city}`)}>
                <img src={d.img} alt={d.city} loading="lazy" />
                <div className="destination-overlay">
                  <h4>{d.city}</h4>
                  <p>{d.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: "var(--surface-soft)" }}>
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center">Book your perfect stay in three simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon"><Search size={28} /></div>
              <h4>Search</h4>
              <p>Browse hotels by city, dates, and preferences with real-time availability.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><CreditCard size={28} /></div>
              <h4>Book</h4>
              <p>Reserve your room instantly with dynamic pricing and secure checkout.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><CheckCircle size={28} /></div>
              <h4>Enjoy</h4>
              <p>Get instant confirmation and manage your bookings from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
