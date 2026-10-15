import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, User, Menu, X, Calendar, Stethoscope, ChevronRight } from "lucide-react";
import { navbarStyles } from "../../assets/dummyStyles";

const STORAGE_KEY = "doctorToken_v1";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Services", href: "/services" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
              MediCare
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-800/60 -mt-1">
              Multi-Speciality Care
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/60 border border-emerald-100 p-1.5 rounded-full shadow-inner">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {isDoctorLoggedIn ? (
            <Link
              to={`/doctor-admin/${localStorage.getItem("doctor_id") || "login"}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-md transition"
            >
              <Stethoscope size={16} />
              <span>Doctor Portal</span>
            </Link>
          ) : (
            <Link
              to="/doctor-admin/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 text-sm font-bold shadow-xs transition"
            >
              <User size={16} />
              <span>Doctor Login</span>
            </Link>
          )}

          <Link
            to="/appointments"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:opacity-95 transition"
          >
            <Calendar size={16} />
            <span>Book Visit</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-emerald-50 transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-6 space-y-3 shadow-xl">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-bold"
            >
              <span>{item.label}</span>
              <ChevronRight size={16} className="text-emerald-500" />
            </Link>
          ))}
          <div className="pt-4 border-t border-emerald-100 flex flex-col gap-2">
            <Link
              to="/doctor-admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl border border-emerald-300 text-emerald-700 text-center font-bold bg-emerald-50"
            >
              Doctor Login
            </Link>
            <Link
              to="/appointments"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-center font-bold shadow"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}