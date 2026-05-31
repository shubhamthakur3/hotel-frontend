"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] || 
        err.response?.data?.error?.message || 
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your StayNest account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${loading ? "btn-loading" : ""}`}
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "" : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link href="/auth/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
