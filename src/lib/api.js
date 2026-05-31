import axios from "axios";

// ─── Axios Instance ─────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies (refresh_token)
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Token Management ───────────────────────────────────────────────────────

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

// ─── Request Interceptor ────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Ensure trailing slash for Django's APPEND_SLASH compatibility.
    // Handles both plain URLs and URLs with query parameters.
    if (config.url) {
      const [path, query] = config.url.split("?");
      if (path && !path.endsWith("/")) {
        config.url = query ? `${path}/?${query}` : `${path}/`;
      }
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (Auto-Refresh on 401) ────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry auth endpoints or already-retried requests
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true }
      );
      const newToken = data.access_token;
      setAccessToken(newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAccessToken();
      // Redirect to login if refresh fails (client-side only)
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── API Methods ────────────────────────────────────────────────────────────
// NOTE: All URLs use trailing slashes to match Django's URL patterns.

/** Authentication */
export const auth = {
  signup: (data) => api.post("/auth/signup/", data),
  login: (data) => api.post("/auth/login/", data),
  refresh: () => api.post("/auth/refresh/"),
  logout: () => api.post("/auth/logout/"),
};

/** Hotels — Public browse */
export const hotels = {
  search: (params) => api.get("/hotels/search/", { params }),
  getInfo: (hotelId) => api.get(`/hotels/${hotelId}/info/`),
};

/** Bookings — Guest flow */
export const bookings = {
  init: (data) => api.post("/bookings/init/", data),
  addGuests: (bookingId, data) =>
    api.post(`/bookings/${bookingId}/addGuests/`, data),
  startPayment: (bookingId) =>
    api.post(`/bookings/${bookingId}/payments/`),
  cancel: (bookingId) => api.post(`/bookings/${bookingId}/cancel/`),
  getStatus: (bookingId) => api.get(`/bookings/${bookingId}/status/`),
};

/** Users — Profile & Guests */
export const users = {
  getProfile: () => api.get("/users/profile/"),
  updateProfile: (data) => api.patch("/users/profile/", data),
  getMyBookings: (params) => api.get("/users/myBookings/", { params }),
  getGuests: () => api.get("/users/guests/"),
  addGuest: (data) => api.post("/users/guests/", data),
  updateGuest: (guestId, data) => api.put(`/users/guests/${guestId}/`, data),
  deleteGuest: (guestId) => api.delete(`/users/guests/${guestId}/`),
};

/** Admin — Hotel Management */
export const admin = {
  // Hotels
  getHotels: (params) => api.get("/admin/hotels/", { params }),
  createHotel: (data) => api.post("/admin/hotels/", data),
  getHotel: (hotelId) => api.get(`/admin/hotels/${hotelId}/`),
  updateHotel: (hotelId, data) => api.put(`/admin/hotels/${hotelId}/`, data),
  deleteHotel: (hotelId) => api.delete(`/admin/hotels/${hotelId}/`),
  activateHotel: (hotelId) => api.patch(`/admin/hotels/${hotelId}/activate/`),

  // Rooms
  getRooms: (hotelId, params) =>
    api.get(`/admin/hotels/${hotelId}/rooms/`, { params }),
  createRoom: (hotelId, data) =>
    api.post(`/admin/hotels/${hotelId}/rooms/`, data),
  getRoom: (hotelId, roomId) =>
    api.get(`/admin/hotels/${hotelId}/rooms/${roomId}/`),
  updateRoom: (hotelId, roomId, data) =>
    api.put(`/admin/hotels/${hotelId}/rooms/${roomId}/`, data),
  deleteRoom: (hotelId, roomId) =>
    api.delete(`/admin/hotels/${hotelId}/rooms/${roomId}/`),

  // Inventory
  getInventory: (roomId, params) =>
    api.get(`/admin/inventory/rooms/${roomId}/`, { params }),
  updateInventory: (roomId, data) =>
    api.patch(`/admin/inventory/rooms/${roomId}/`, data),

  // Bookings & Reports
  getHotelBookings: (hotelId, params) =>
    api.get(`/admin/hotels/${hotelId}/bookings/`, { params }),
  getReports: (hotelId, params) =>
    api.get(`/admin/hotels/${hotelId}/reports/`, { params }),
  manualConfirm: (bookingId, data) =>
    api.post(`/admin/bookings/${bookingId}/manual-confirm/`, data),
};

export default api;

