import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { loginPageStyles, toastStyles } from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

const STORAGE_KEY = "doctorToken_v1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/doctors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(json?.message || "Login failed");
        setBusy(false);
        return;
      }

      const token = json?.token || json?.data?.token;
      if (!token) {
        toast.error("Authentication token missing");
        setBusy(false);
        return;
      }

      const doctorId =
        json?.data?._id || json?.doctor?._id || json?.data?.doctor?._id || json?.doctor?.id || json?.data?.id;
      if (!doctorId) {
        toast.error("Doctor ID missing from server response");
        setBusy(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem("doctor_id", doctorId);
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: token })
      );
      toast.success("Login successful - redirecting...");
      setTimeout(() => {
        navigate(`/doctor-admin/${doctorId}`);
      }, 700);
    } catch (err) {
      console.error("login error", err);
      toast.error("Network error during login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={loginPageStyles.mainContainer}>
      <Link to="/" className={loginPageStyles.backButton}>
        <ArrowLeft className={loginPageStyles.backButtonIcon} /> Back to Home
      </Link>

      <div className={loginPageStyles.loginCard}>
        <div className={loginPageStyles.logoContainer}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Lock size={32} />
          </div>
        </div>
        <h2 className={loginPageStyles.title}>Doctor Portal</h2>
        <p className={loginPageStyles.subtitle}>Sign in to manage appointments & schedule</p>

        <form onSubmit={handleLogin} className={loginPageStyles.form}>
          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1">Doctor Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dr1@gmail.com"
              className={loginPageStyles.input}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={loginPageStyles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`${loginPageStyles.submitButton} ${busy ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 transition"}`}
          >
            {busy ? "Signing in..." : "Doctor Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Demo Doctor: <span className="font-semibold text-emerald-700">dr1@gmail.com</span> / <span className="font-semibold text-emerald-700">password123</span>
        </div>
      </div>
    </div>
  );
}