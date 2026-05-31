"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { users as usersApi, admin as adminApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { User, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  
  // Guest form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestGender, setNewGuestGender] = useState("OTHER");
  
  // Editing state
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingGender, setEditingGender] = useState("OTHER");

  // Manager Specific States
  const [myHotels, setMyHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!isAuthenticated) return;

    const isStaff = user?.roles?.includes("HOTEL_MANAGER") || user?.roles?.includes("ADMIN");
    if (isStaff) {
      fetchGuests();
      adminApi.getHotels().then(({ data }) => {
        const hotelList = data.results || data || [];
        setMyHotels(hotelList);
        if (hotelList.length > 0) {
          setSelectedHotelId(hotelList[0].id.toString());
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, authLoading, router, user]);

  const fetchGuests = async () => {
    setLoadingGuests(true);
    try {
      const { data } = await usersApi.getGuests();
      setGuests(data || []);
    } catch (err) {
      toast.error("Failed to load guests");
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuestName.trim()) {
      toast.error("Guest name is required");
      return;
    }
    if (!selectedHotelId) {
      toast.error("Please select a hotel property for this guest");
      return;
    }
    try {
      const { data } = await usersApi.addGuest({
        name: newGuestName,
        gender: newGuestGender,
        hotel_id: parseInt(selectedHotelId),
      });
      setGuests((prev) => [data, ...prev]);
      setNewGuestName("");
      setNewGuestGender("OTHER");
      setShowAddForm(false);
      toast.success("Guest profile created");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to add guest");
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!confirm("Are you sure you want to remove this guest profile?")) return;
    try {
      await usersApi.deleteGuest(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
      toast.success("Guest profile removed");
    } catch (err) {
      toast.error("Failed to remove guest");
    }
  };

  const startEditing = (guest) => {
    setEditingGuestId(guest.id);
    setEditingName(guest.name);
    setEditingGender(guest.gender);
  };

  const handleUpdateGuest = async (id) => {
    if (!editingName.trim()) {
      toast.error("Guest name cannot be empty");
      return;
    }
    try {
      const { data } = await usersApi.updateGuest(id, {
        name: editingName,
        gender: editingGender,
      });
      setGuests((prev) => prev.map((g) => (g.id === id ? data : g)));
      setEditingGuestId(null);
      toast.success("Guest profile updated");
    } catch (err) {
      toast.error("Failed to update guest");
    }
  };

  if (authLoading) return null;

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-lg">
            {user?.name?.charAt(0).toUpperCase() || <User />}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p style={{ marginTop: 8 }}>
              {user?.roles?.map((role) => (
                <span key={role} className="badge badge-primary" style={{ marginRight: 6 }}>
                  {role}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Guests Section (Hotel Manager / Admin only) */}
        {(user?.roles?.includes("HOTEL_MANAGER") || user?.roles?.includes("ADMIN")) && (
          <div className="guests-section" style={{ marginTop: "var(--space-8)" }}>
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
              <h3>Saved Guests</h3>
              {!showAddForm && myHotels.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                  <Plus size={16} /> Add Guest
                </button>
              )}
            </div>

            {myHotels.length === 0 && (
              <div className="alert alert-warning" style={{ marginBottom: "var(--space-4)", display: "flex", gap: 12, alignItems: "center" }}>
                <span>You must list at least one Hotel Property before you can create guest profiles.</span>
              </div>
            )}

            {/* Add Guest Form */}
            {showAddForm && (
              <form onSubmit={handleAddGuest} className="add-guest-form card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter guest name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={newGuestGender}
                      onChange={(e) => setNewGuestGender(e.target.value)}
                      style={{ width: "100%", height: "42px", padding: "0 var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                  <label className="form-label">Associate with Hotel Property</label>
                  <select
                    className="form-select"
                    value={selectedHotelId}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    required
                    style={{ width: "100%", height: "42px", padding: "0 var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}
                  >
                    {myHotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Guest List */}
            {loadingGuests ? (
              <div>
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton skeleton-card" style={{ height: 60, marginBottom: 12 }} />
                ))}
              </div>
            ) : guests.length > 0 ? (
              <div>
                {guests.map((guest) => (
                  <div key={guest.id} className="guest-row">
                    {editingGuestId === guest.id ? (
                      <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", alignItems: "center" }}>
                        <input
                          type="text"
                          className="form-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          style={{ flex: 2 }}
                        />
                        <select
                          className="form-select"
                          value={editingGender}
                          onChange={(e) => setEditingGender(e.target.value)}
                          style={{ flex: 1, height: "42px" }}
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <button className="btn btn-primary btn-icon" onClick={() => handleUpdateGuest(guest.id)}>
                          <Check size={16} />
                        </button>
                        <button className="btn btn-outline btn-icon" onClick={() => setEditingGuestId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="guest-row-info">
                          <strong>{guest.name}</strong>
                          <span className="badge badge-neutral">{guest.gender}</span>
                        </div>
                        <div className="guest-row-actions">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEditing(guest)}>
                            <Edit2 size={16} className="text-muted" />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDeleteGuest(guest.id)}>
                            <Trash2 size={16} className="text-muted" style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "var(--space-8)" }}>
                <p>No saved guest profiles yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
