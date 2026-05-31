"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { hotels as hotelsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getHotelImage, getRoomImage, formatCurrency, getRoomTypeLabel } from "@/lib/utils";
import { MapPin, Mail, Phone, Users, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function HotelDetailPage({ params }) {
  const { hotelId } = use(params);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await hotelsApi.getInfo(hotelId);
        setHotel(data);
      } catch {
        toast.error("Hotel not found");
        router.push("/search");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId, router]);

  const handleBookRoom = (room) => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a room");
      router.push("/auth/login");
      return;
    }
    const params = new URLSearchParams({
      hotelId: hotel.id,
      roomId: room.id,
      hotelName: hotel.name,
      roomType: room.type_display || room.type,
      basePrice: room.base_price,
    });
    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="hotel-detail">
        <div className="container">
          <div className="skeleton" style={{ height: 400, marginBottom: 32, borderRadius: 16 }} />
          <div className="skeleton skeleton-heading" style={{ marginBottom: 16 }} />
          <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ marginBottom: 32 }} />
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  const photos = hotel.photos?.length > 0 ? hotel.photos : [];
  const galleryImages = photos.length >= 5
    ? photos.slice(0, 5)
    : Array.from({ length: 5 }, (_, i) => getHotelImage(photos, i));

  return (
    <div className="hotel-detail">
      <div className="container">
        {/* Gallery */}
        <div className="hotel-gallery">
          {galleryImages.map((img, i) => (
            <img key={i} src={img} alt={`${hotel.name} photo ${i + 1}`} loading="lazy" />
          ))}
        </div>

        {/* Info */}
        <div className="hotel-info">
          <div className="hotel-info-main">
            <h1>{hotel.name}</h1>
            <p className="hotel-city-label"><MapPin size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {hotel.city}</p>

            {hotel.description && <p className="hotel-description">{hotel.description}</p>}

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <div className="amenities-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {hotel.amenities.map((a) => (
                    <div key={a} className="amenity-item">
                      <Check size={16} color="var(--success)" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {hotel.contact_info && (
              <div className="contact-section">
                <h3>Contact</h3>
                {hotel.contact_info.complete_address && (
                  <div className="contact-item"><MapPin size={14} /> {hotel.contact_info.complete_address}</div>
                )}
                {hotel.contact_info.email && (
                  <div className="contact-item"><Mail size={14} /> {hotel.contact_info.email}</div>
                )}
                {hotel.contact_info.phone_number && (
                  <div className="contact-item"><Phone size={14} /> {hotel.contact_info.phone_number}</div>
                )}
              </div>
            )}

            {/* Rooms */}
            <div className="rooms-section">
              <h2>Available Rooms</h2>
              <div className="room-cards">
                {hotel.rooms?.map((room, idx) => (
                  <div key={room.id} className="room-card">
                    <img className="room-card-img" src={getRoomImage(room.photos, idx)} alt={room.type_display || room.type} loading="lazy" />
                    <div className="room-card-info">
                      <h4>
                        <span className="badge badge-primary" style={{ marginRight: 8 }}>{getRoomTypeLabel(room.type)}</span>
                      </h4>
                      <p className="room-card-capacity"><Users size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Up to {room.capacity} guests</p>
                      {room.amenities?.length > 0 && (
                        <div className="room-card-amenities">
                          {room.amenities.slice(0, 4).map((a) => (
                            <span key={a} className="badge badge-neutral">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="room-card-action">
                      <div className="room-card-price">
                        {formatCurrency(room.base_price)}
                        <span>per night</span>
                      </div>
                      <button className="btn btn-primary" onClick={() => handleBookRoom(room)}>Book Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
