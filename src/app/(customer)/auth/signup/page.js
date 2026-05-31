"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("GUEST");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password, confirmPassword, role);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.error?.message ||
        "Registration failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up for a StayNest account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Register As</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="GUEST">Guest (Browse & Book Rooms)</option>
              <option value="HOTEL_MANAGER">Hotel Manager (List & Manage Hotels)</option>
            </select>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${loading ? "btn-loading" : ""}`}
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "" : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/auth/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
