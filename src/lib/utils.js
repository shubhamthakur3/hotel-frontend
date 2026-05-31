/**
 * Utility functions — formatters, helpers, and constants.
 */

// ─── Currency Formatter ─────────────────────────────────────────────────────

export function formatCurrency(amount, currency = "INR") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

// ─── Date Formatters ────────────────────────────────────────────────────────

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateISO(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Booking Status ─────────────────────────────────────────────────────────

export const BOOKING_STATUS = {
  RESERVED: { label: "Reserved", className: "status-reserved" },
  GUESTS_ADDED: { label: "Guests Added", className: "status-guests-added" },
  PAYMENTS_PENDING: { label: "Payment Pending", className: "status-payments-pending" },
  CONFIRMED: { label: "Confirmed", className: "status-confirmed" },
  CANCELLED: { label: "Cancelled", className: "status-cancelled" },
  EXPIRED: { label: "Expired", className: "status-expired" },
  FAILED: { label: "Failed", className: "status-failed" },
};

export function getStatusInfo(status) {
  return BOOKING_STATUS[status] || { label: status, className: "badge-neutral" };
}

// ─── Room Type Labels ───────────────────────────────────────────────────────

export const ROOM_TYPES = {
  STANDARD: "Standard",
  DELUXE: "Deluxe",
  SUITE: "Suite",
};

export function getRoomTypeLabel(type) {
  return ROOM_TYPES[type] || type;
}

// ─── Placeholder Images ────────────────────────────────────────────────────

const PLACEHOLDER_HOTELS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
];

const PLACEHOLDER_ROOMS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d955f49ed?w=800&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
];

/**
 * Returns image URL — uses backend photo if available, otherwise a placeholder.
 */
export function getHotelImage(photos, index = 0) {
  if (photos && photos.length > 0 && photos[index]) {
    return photos[index];
  }
  return PLACEHOLDER_HOTELS[index % PLACEHOLDER_HOTELS.length];
}

export function getRoomImage(photos, index = 0) {
  if (photos && photos.length > 0 && photos[index]) {
    return photos[index];
  }
  return PLACEHOLDER_ROOMS[index % PLACEHOLDER_ROOMS.length];
}

// ─── Amenity Icons Map ──────────────────────────────────────────────────────

export const AMENITY_ICONS = {
  wifi: "Wifi",
  pool: "Waves",
  gym: "Dumbbell",
  spa: "Sparkles",
  parking: "Car",
  restaurant: "UtensilsCrossed",
  bar: "Wine",
  "room service": "ConciergeBell",
  "air conditioning": "AirVent",
  tv: "Tv",
  minibar: "Refrigerator",
  balcony: "Mountain",
  "pet friendly": "PawPrint",
  "free breakfast": "Coffee",
  laundry: "Shirt",
  "business center": "Briefcase",
};

export function getAmenityIcon(amenity) {
  const key = amenity.toLowerCase().trim();
  return AMENITY_ICONS[key] || "Check";
}

// ─── Misc Helpers ───────────────────────────────────────────────────────────

export function truncate(str, length = 100) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "…" : str;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || singular + "s";
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
