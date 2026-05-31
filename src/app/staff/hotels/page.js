"use client";

import { useState, useEffect, useRef } from "react";
import { admin as adminApi } from "@/lib/api";
import { Plus, Edit2, Trash2, ShieldAlert, Check, X, Building, MapPin, Eye, Camera } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function StaffHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer / Form states
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amenities, setAmenities] = useState("");
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getHotels();
      setHotels(data.results || []);
    } catch (err) {
      toast.error("Failed to load hotels list");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload images only");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ""; // reset file input
  };

  const openCreateDrawer = () => {
    setEditingHotel(null);
    setName("");
    setCity("");
    setDescription("");
    setAddress("");
    setEmail("");
    setPhone("");
    setAmenities("");
    setPhotos([]);
    setShowDrawer(true);
  };

  const openEditDrawer = (hotel) => {
    setEditingHotel(hotel);
    setName(hotel.name || "");
    setCity(hotel.city || "");
    setDescription(hotel.description || "");
    setAddress(hotel.contact_info?.complete_address || "");
    setEmail(hotel.contact_info?.email || "");
    setPhone(hotel.contact_info?.phone_number || "");
    setAmenities(hotel.amenities ? hotel.amenities.join(", ") : "");
    setPhotos(hotel.photos || []);
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      toast.error("Name and City are required");
      return;
    }

    const payload = {
      name,
      city,
      description,
      amenities: amenities ? amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      photos,
      contact_info: {
        complete_address: address,
        email,
        phone_number: phone,
      },
    };

    try {
      if (editingHotel) {
        await adminApi.updateHotel(editingHotel.id, payload);
        toast.success("Hotel details updated");
      } else {
        await adminApi.createHotel(payload);
        toast.success("Hotel listed successfully");
      }
      fetchHotels();
      setShowDrawer(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to save hotel");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this hotel? All associated room inventory and bookings will be lost!")) return;
    try {
      await adminApi.deleteHotel(id);
      toast.success("Hotel deleted");
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      toast.error("Failed to delete hotel");
    }
  };

  const handleActivate = async (id) => {
    try {
      await adminApi.activateHotel(id);
      toast.success("Hotel activation status toggled");
      fetchHotels();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Hotel Properties</h2>
          <p className="text-muted">Manage your listed properties and configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateDrawer}>
          <Plus size={18} /> Add Property
        </button>
      </div>

      {/* Hotels Table / Grid */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton skeleton-card" style={{ height: 120 }} />
          ))}
        </div>
      ) : hotels.length > 0 ? (
        <div className="table-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property Details</th>
                  <th>Location</th>
                  <th>Amenities</th>
                  <th>Verification</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>
                      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                        <div className="stat-card-icon accent" style={{ width: 40, height: 40 }}>
                          <Building size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: "var(--font-sm)" }}>{hotel.name}</strong>
                          <span style={{ display: "block", fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                            ID: #{hotel.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)" }}>
                        <MapPin size={14} />
                        <span>{hotel.city}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 280 }}>
                        {hotel.amenities?.slice(0, 3).map((a) => (
                          <span key={a} className="badge badge-neutral" style={{ fontSize: "10px" }}>
                            {a}
                          </span>
                        )) || "-"}
                        {hotel.amenities?.length > 3 && (
                          <span className="badge badge-neutral" style={{ fontSize: "10px" }}>
                            +{hotel.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`badge ${hotel.is_active ? "badge-success" : "badge-danger"}`}
                        onClick={() => handleActivate(hotel.id)}
                        title="Click to toggle activation status"
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {hotel.is_active ? "Verified & Active" : "Inactive / Draft"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <Link 
                          href={`/staff/hotels/${hotel.id}/rooms`}
                          className="btn btn-outline btn-sm"
                          title="Configure Rooms"
                        >
                          <Eye size={14} /> Manage
                        </Link>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditDrawer(hotel)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleDelete(hotel.id)}
                        >
                          <Trash2 size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state card" style={{ padding: "var(--space-12)" }}>
          <Building size={48} style={{ opacity: 0.3, margin: "0 auto var(--space-4)" }} />
          <h3>No properties listed</h3>
          <p>Get started by listing your first hotel property.</p>
          <button className="btn btn-primary" onClick={openCreateDrawer} style={{ marginTop: 12 }}>
            Add Hotel Property
          </button>
        </div>
      )}

      {/* Create / Edit Side Drawer */}
      {showDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowDrawer(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{editingHotel ? "Modify Hotel Property" : "List New Hotel Property"}</h3>
              <button onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "contents" }}>
              <div className="drawer-body">
                <div className="form-group">
                  <label className="form-label">Property Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. StayNest Grand Resort"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Goa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                    placeholder="WiFi, Pool, Spa, Free Parking"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Complete Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Landmark, City PIN"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reservations@hotel.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Property Description</label>
                  <textarea
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a charming summary description..."
                    rows={4}
                    style={{ fontFamily: "inherit", resize: "none" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Add some photos of your hotel</label>
                  <p className="text-muted" style={{ fontSize: "var(--font-xs)", marginBottom: "var(--space-2)" }}>
                    You can add more or make changes later.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <div style={{
                    border: "2px dashed var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-6)",
                    textAlign: "center",
                    backgroundColor: "var(--surface-soft)",
                    marginBottom: "var(--space-3)"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div className="stat-card-icon" style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--surface-card)", color: "var(--text-secondary)", margin: "0 auto" }}>
                        <Camera size={20} />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Add photos
                      </button>
                    </div>
                  </div>

                  {photos.length > 0 && (
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", 
                      gap: "var(--space-2)", 
                      marginTop: "var(--space-2)" 
                    }}>
                      {photos.map((url, index) => (
                        <div key={index} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
                          <img src={url} alt={`Hotel Photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "10px",
                              lineHeight: 1
                            }}
                            onClick={() => {
                              setPhotos((prev) => prev.filter((_, i) => i !== index));
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDrawer(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingHotel ? "Save Changes" : "Publish Property"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
