import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  UserPlus,
  Users,
  Calendar,
  Grid,
  PlusSquare,
  List,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { navbarStyles as ns } from "../../assets/dummyStyles";
import logoImg from "../../assets/logo.png";

function CenterNavItem({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`nav-item ${ns.centerNavItemBase} ${
        isActive ? `${ns.centerNavItemActive} active` : ns.centerNavItemInactive
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileItem({ to, label, icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${ns.mobileItemBase} ${
        isActive ? ns.mobileItemActive : ns.mobileItemInactive
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navInnerRef = useRef(null);
  const indicatorRef = useRef(null);

  const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);
    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={ns.header}>
      <div className={ns.navContainer}>
        <div className={ns.flexContainer}>
          {/* Logo */}
          <Link to="/" className={ns.logoContainer}>
            <img src={logoImg} alt="MediCare" className={ns.logoImage} />
            <div>
              <span className={ns.logoLink}>MediCare</span>
              <p className={ns.logoSubtext}>Hospital Admin Panel</p>
            </div>
          </Link>

          {/* Center Navigation Desktop */}
          <div className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>
                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <CenterNavItem to="/" label="Home" icon={<Home size={16} />} />
                  <CenterNavItem to="/dashboard" label="Dashboard" icon={<Grid size={16} />} />
                  <CenterNavItem to="/add" label="Add Doctor" icon={<UserPlus size={16} />} />
                  <CenterNavItem to="/list" label="List Doctors" icon={<Users size={16} />} />
                  <CenterNavItem to="/appointments" label="Appointments" icon={<Calendar size={16} />} />
                  <CenterNavItem to="/service-dashboard" label="Service Dashboard" icon={<Grid size={16} />} />
                  <CenterNavItem to="/add-service" label="Add Service" icon={<PlusSquare size={16} />} />
                  <CenterNavItem to="/list-service" label="List Services" icon={<List size={16} />} />
                  <CenterNavItem to="/service-appointments" label="Service Appointments" icon={<Calendar size={16} />} />
                  <div ref={indicatorRef} className={ns.indicator} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Admin Badge */}
          <div className={ns.rightContainer}>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck size={16} />
              <span>PostgreSQL Active</span>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className={ns.mobileMenuButton}
              aria-label="Toggle navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {open && (
          <div className={ns.mobileMenuContainer}>
            <div className={ns.mobileMenuInner}>
              <MobileItem to="/" label="Home" icon={<Home size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/dashboard" label="Dashboard" icon={<Grid size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/add" label="Add Doctor" icon={<UserPlus size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/list" label="List Doctors" icon={<Users size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/appointments" label="Appointments" icon={<Calendar size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/service-dashboard" label="Service Dashboard" icon={<Grid size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/add-service" label="Add Service" icon={<PlusSquare size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/list-service" label="List Services" icon={<List size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/service-appointments" label="Service Appointments" icon={<Calendar size={16} />} onClick={() => setOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
