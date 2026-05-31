"use client";

import { useState, useEffect, use } from "react";
import { admin as adminApi } from "@/lib/api";
import { formatCurrency, getRoomTypeLabel, formatDateISO } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Sliders, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffInventoryPage({ params }) {
  const resolvedParams = use(params);
  const hotelId = resolvedParams.hotelId;

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bulk update states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [surgeFactor, setSurgeFactor] = useState("1.0");
  const [totalCount, setTotalCount] = useState("");
  const [isClosed, setIsClosed] = useState("false");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchInventory();
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      const { data } = await adminApi.getRooms(hotelId);
      const list = Array.isArray(data) ? data : (data.results || []);
      setRooms(list);
      if (list.length > 0) {
        setSelectedRoomId(list[0].id.toString());
      }
    } catch (err) {
      toast.error("Failed to load room classes");
    }
  };

  const fetchInventory = async () => {
    if (!selectedRoomId) {
      return;
    }
    setLoading(true);
    try {
      // Get inventory for next 30 days
      const todayStr = formatDateISO(new Date());
      const future = new Date();
      future.setDate(future.getDate() + 29);
      const futureStr = formatDateISO(future);

      const { data } = await adminApi.getInventory(selectedRoomId, {
        start_date: todayStr,
        end_date: futureStr,
      });
      setInventory(data || []);
    } catch (err) {
      toast.error("Failed to fetch inventory records");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error("Please select a room class first");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Start Date and End Date are required");
      return;
    }

    setUpdating(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      surge_factor: parseFloat(surgeFactor),
      closed: isClosed === "true",
    };

    if (totalCount.trim() !== "") {
      payload.total_count = parseInt(totalCount);
    }

    try {
      await adminApi.updateInventory(selectedRoomId, payload);
      toast.success("Inventory grid updated successfully");
      fetchInventory();
      
      // Reset form
      setStartDate("");
      setEndDate("");
      setSurgeFactor("1.0");
      setTotalCount("");
      setIsClosed("false");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to update inventory");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Inventory & Dynamic Pricing Calendar</h2>
          <p className="text-muted">Control surge pricing multipliers, close rooms, and manage inventory.</p>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <select
            className="form-select"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {getRoomTypeLabel(room.type)} (ID: #{room.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Calendar display */}
        <div className="chart-card" style={{ padding: "var(--space-5)" }}>
          <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600 }}>Next 30 Days Overview</h3>
            <button className="btn btn-ghost btn-sm" onClick={fetchInventory} disabled={loading}>
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 90 }} />
              ))}
            </div>
          ) : inventory.length > 0 ? (
            <div>
              <div className="inventory-calendar">
                {/* Headers */}
                <div className="calendar-day-header">Mon</div>
                <div className="calendar-day-header">Tue</div>
                <div className="calendar-day-header">Wed</div>
                <div className="calendar-day-header">Thu</div>
                <div className="calendar-day-header">Fri</div>
                <div className="calendar-day-header">Sat</div>
                <div className="calendar-day-header">Sun</div>

                {/* Days */}
                {inventory.map((day) => {
                  const date = new Date(day.date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div 
                      key={day.date} 
                      className="calendar-day-cell"
                      style={{
                        backgroundColor: day.closed 
                          ? "#ffeae6" 
                          : day.available_count === 0 
                            ? "var(--surface-soft)" 
                            : isWeekend ? "#fffdf5" : "var(--surface-card)"
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="calendar-day-number">{date.getDate()} {date.toLocaleDateString("en-IN", { month: "short" })}</span>
                        {day.closed && <span className="badge badge-danger" style={{ fontSize: "8px", padding: "1px 4px" }}>Closed</span>}
                      </div>

                      <div className="calendar-day-stats">
                        {!day.closed ? (
                          <>
                            <span className="calendar-day-stat price">{formatCurrency(day.price)}</span>
                            <span 
                              className="calendar-day-stat" 
                              style={{ 
                                fontSize: "10px", 
                                color: day.available_count > 0 ? "var(--success)" : "var(--text-secondary)",
                                fontWeight: 500
                              }}
                            >
                              {day.available_count} / {day.total_count} left
                            </span>
                            <span className="calendar-day-stat text-muted" style={{ fontSize: "9px" }}>
                              Surge: {day.surge_factor}x
                            </span>
                          </>
                        ) : (
                          <span className="calendar-day-stat closed" style={{ fontSize: "10px" }}>Closed for Booking</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-12) 0" }}>
              <Calendar size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
              <p>No inventory records found for this room class. Ensure room classes are configured.</p>
            </div>
          )}
        </div>

        {/* Bulk Update Controls */}
        <div className="chart-card">
          <h3 style={{ fontSize: "var(--font-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
            Bulk Operations Control
          </h3>
          <form onSubmit={handleBulkUpdate} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Surge Price Multiplier *</label>
              <input
                type="number"
                className="form-input"
                value={surgeFactor}
                onChange={(e) => setSurgeFactor(e.target.value)}
                placeholder="e.g. 1.2"
                step="0.1"
                min="0.5"
                max="5.0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Update Max Capacity Count (Optional)</label>
              <input
                type="number"
                className="form-input"
                value={totalCount}
                onChange={(e) => setTotalCount(e.target.value)}
                placeholder="Override total room count"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Close Sales Status *</label>
              <select
                className="form-select"
                value={isClosed}
                onChange={(e) => setIsClosed(e.target.value)}
              >
                <option value="false">Open for Bookings</option>
                <option value="true">Closed / Stop Sell</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }} disabled={updating}>
              <Save size={16} /> {updating ? "Applying Updates..." : "Apply Bulk Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
