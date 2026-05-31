"use client";

import { useState, useEffect, use, useRef } from "react";
import { admin as adminApi } from "@/lib/api";
import { Plus, Edit2, Trash2, X, Users, DoorOpen, ListChecks, Camera } from "lucide-react";
import { formatCurrency, getRoomTypeLabel } from "@/lib/utils";
import toast from "react-hot-toast";

export default function StaffRoomsPage({ params }) {
  const resolvedParams = use(params);
  const hotelId = resolvedParams.hotelId;

  const [rooms, setRooms] = useState([]);
  const [hotelName, setHotelName] = useState("Hotel Property");
  const [loading, setLoading] = useState(true);

  // Form / Drawer Drawer Drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Room form fields
  const [type, setType] = useState("STANDARD");
  const [basePrice, setBasePrice] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [totalCount, setTotalCount] = useState("5");
  const [amenities, setAmenities] = useState("");
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    fetchHotelDetails();
    fetchRooms();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      const { data } = await adminApi.getHotel(hotelId);
      setHotelName(data.name || "Hotel Property");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getRooms(hotelId);
      const list = Array.isArray(data) ? data : (data.results || []);
      setRooms(list);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDrawer = () => {
    setEditingRoom(null);
    setType("STANDARD");
    setBasePrice("");
    setCapacity("2");
    setTotalCount("5");
    setAmenities("");
    setPhotos([]);
    setShowDrawer(true);
  };

  const openEditDrawer = (room) => {
    setEditingRoom(room);
    setType(room.type || "STANDARD");
    setBasePrice(room.base_price || "");
    setCapacity(room.capacity || "2");
    setTotalCount(room.total_count || "5");
    setAmenities(room.amenities ? room.amenities.join(", ") : "");
    setPhotos(room.photos || []);
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!basePrice || !capacity || !totalCount) {
      toast.error("Price, capacity, and total inventory count are required");
      return;
    }

    const payload = {
      type,
      base_price: parseFloat(basePrice),
      capacity: parseInt(capacity),
      total_count: parseInt(totalCount),
      photos,
      amenities: amenities ? amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
    };

    try {
      if (editingRoom) {
        await adminApi.updateRoom(hotelId, editingRoom.id, payload);
        toast.success("Room type updated successfully");
      } else {
        await adminApi.createRoom(hotelId, payload);
        toast.success("New room type created successfully");
      }
      fetchRooms();
      setShowDrawer(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to save room details");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this room type? All associated inventory dates will be deleted!")) return;
    try {
      await adminApi.deleteRoom(hotelId, id);
      toast.success("Room type deleted");
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error("Failed to delete room type");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Configure Rooms</h2>
          <p className="text-muted">Currently managing: <strong style={{ color: "var(--text-primary)" }}>{hotelName}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={openCreateDrawer}>
          <Plus size={18} /> Add Room Type
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton skeleton-card" style={{ height: 100 }} />
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="table-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Class</th>
                  <th>Capacity Limit</th>
                  <th>Standard Price</th>
                  <th>Total Inventory</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                        <div className="stat-card-icon" style={{ width: 36, height: 36 }}>
                          <DoorOpen size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: "var(--font-sm)" }}>{getRoomTypeLabel(room.type)}</strong>
                          <span style={{ display: "block", fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                            ID: #{room.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Users size={14} className="text-muted" />
                        <span>Up to {room.capacity} guests</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary)" }}>{formatCurrency(room.base_price)}</strong>
                      <span className="text-muted" style={{ fontSize: "var(--font-xs)" }}> / night</span>
                    </td>
                    <td>
                      <span>{room.total_count} rooms</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 240 }}>
                        {room.amenities?.slice(0, 3).map((a) => (
                          <span key={a} className="badge badge-neutral" style={{ fontSize: "10px" }}>
                            {a}
                          </span>
                        )) || "-"}
                        {room.amenities?.length > 3 && (
                          <span className="badge badge-neutral" style={{ fontSize: "10px" }}>
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditDrawer(room)}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleDelete(room.id)}
                        >
                          <Trash2 size={12} style={{ color: "var(--danger)" }} />
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
          <DoorOpen size={48} style={{ opacity: 0.3, margin: "0 auto var(--space-4)" }} />
          <h3>No Room Configurations</h3>
          <p>Create room configurations for StayNest to start accepting bookings.</p>
          <button className="btn btn-primary" onClick={openCreateDrawer} style={{ marginTop: 12 }}>
            Add Room Type
          </button>
        </div>
      )}

      {/* Slide Drawer Drawer */}
      {showDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowDrawer(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{editingRoom ? "Edit Room Class Configuration" : "Add Room Class"}</h3>
              <button onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "contents" }}>
              <div className="drawer-body">
                <div className="form-group">
                  <label className="form-label">Room Type *</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="STANDARD">Standard Room</option>
                    <option value="DELUXE">Deluxe Suite</option>
                    <option value="SUITE">Luxury Presidential Suite</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (Per Night in INR) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="e.g. 4500"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Guest Capacity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 2"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Room Inventory Count *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={totalCount}
                    onChange={(e) => setTotalCount(e.target.value)}
                    placeholder="Number of rooms of this type available"
                    min="1"
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
                    placeholder="King Bed, Flat TV, Minibar, Ocean View"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Add some photos of your room</label>
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
                          <img src={url} alt={`Room Photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                  {editingRoom ? "Save Config" : "Publish Configuration"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
