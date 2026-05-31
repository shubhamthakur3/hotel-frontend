"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hotels as hotelsApi } from "@/lib/api";
import { getHotelImage, formatCurrency, truncate } from "@/lib/utils";
import { MapPin, Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const city = searchParams.get("city") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = searchParams.get("guests") || "";

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {};
        if (city) params.city = city;
        if (checkIn) params.check_in = checkIn;
        if (checkOut) params.check_out = checkOut;
        if (guests) params.guests = guests;
        const { data } = await hotelsApi.search(params);
        setResults(data.results || []);
        setTotalCount(data.count || 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [city, checkIn, checkOut, guests]);

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <div>
            <h1 style={{ fontSize: "var(--font-2xl)" }}>
              {city ? `Hotels in ${city}` : "All Hotels"}
            </h1>
            <p className="search-count">
              {loading ? "Searching..." : `${totalCount} ${totalCount === 1 ? "property" : "properties"} found`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="hotel-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="hotel-card">
                <div className="skeleton" style={{ height: 200 }} />
                <div className="hotel-card-body">
                  <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: 8 }} />
                  <div className="skeleton skeleton-heading" style={{ marginBottom: 8 }} />
                  <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="hotel-grid">
            {results.map((hotel, idx) => (
              <div
                key={hotel.id}
                className="hotel-card"
                onClick={() => router.push(`/hotels/${hotel.id}`)}
              >
                <img
                  className="hotel-card-img"
                  src={getHotelImage(hotel.photos, idx)}
                  alt={hotel.name}
                  loading="lazy"
                />
                <div className="hotel-card-body">
                  <p className="hotel-card-city">
                    <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {hotel.city}
                  </p>
                  <h3 className="hotel-card-name">{hotel.name}</h3>
                  {hotel.amenities?.length > 0 && (
                    <div className="hotel-card-amenities">
                      {hotel.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="badge badge-neutral">{a}</span>
                      ))}
                    </div>
                  )}
                  <p className="hotel-card-price">
                    {hotel.min_price ? formatCurrency(hotel.min_price) : "View rooms"}{" "}
                    {hotel.min_price && <span>/ night</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Search /></div>
            <h3>No hotels found</h3>
            <p>Try adjusting your search filters or explore a different city.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{padding:"var(--space-16) 0",textAlign:"center"}}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
