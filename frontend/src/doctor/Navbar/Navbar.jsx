import React, { useMemo } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Home, Calendar, Edit, LogOut, Activity } from "lucide-react";
import { navbarStylesDr } from "../../assets/dummyStyles";

export default function DoctorNavbar() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const doctorId = useMemo(() => {
    if (params?.id) return params.id;
    const m = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    if (m) return m[1];
    return localStorage.getItem("doctor_id") || null;
  }, [params, location.pathname]);

  const basePath = doctorId ? `/doctor-admin/${doctorId}` : "/doctor-admin/login";

  const navItems = [
    { name: "Dashboard", to: `${basePath}`, Icon: Home },
    { name: "Appointments", to: `${basePath}/appointments`, Icon: Calendar },
    { name: "Edit Profile", to: `${basePath}/profile/edit`, Icon: Edit },
  ];

  const handleLogout = () => {
    localStorage.removeItem("doctorToken_v1");
    localStorage.removeItem("doctor_id");
    navigate("/doctor-admin/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <Activity size={20} />
            </div>
            <span className="font-extrabold text-lg text-emerald-900 tracking-tight">
              MediCare <span className="text-emerald-600 font-medium text-sm">Doctor Panel</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.Icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-full transition"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}