import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, CheckCircle, XCircle, Search, Phone, User } from "lucide-react";
import { listPageStyles } from "../../assets/dummyStyles";

export default function DoctorListPage() {
  const params = useParams();
  const doctorId = params.id;
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/doctor/${encodeURIComponent(doctorId)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || `Failed to fetch appointments (${res.status})`);
      }
      const list = (body && (body.appointments || body.data || body)) || [];
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("fetch appointments error:", err);
      setError("Failed to load doctor appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, API_BASE]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id || a._id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchSearch =
        !search.trim() ||
        (a.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.mobile || "").includes(search);
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  return (
    <div className={listPageStyles.pageContainer}>
      <div className={listPageStyles.contentWrapper}>
        <div className={listPageStyles.headerContainer}>
          <div>
            <h1 className={listPageStyles.headerTitle}>Doctor Appointments</h1>
            <p className={listPageStyles.headerSubtitle}>
              Manage consultations, track status, and patient visits
            </p>
          </div>

          <div className={listPageStyles.searchFilterContainer}>
            <div className={listPageStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search patient name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={listPageStyles.searchInput}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={listPageStyles.statusFilter}
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Canceled">Canceled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className={listPageStyles.errorContainer}>{error}</div>
        )}

        {loading ? (
          <div className={listPageStyles.loadingContainer}>Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100 text-slate-500">
            No appointments found matching your criteria.
          </div>
        ) : (
          <div className={listPageStyles.appointmentsGrid}>
            {filtered.map((a) => (
              <div key={a.id || a._id} className={listPageStyles.appointmentCard}>
                <div>
                  <div className={listPageStyles.cardHeader}>
                    <div className={listPageStyles.cardAvatar}>
                      <User className="text-emerald-600" size={24} />
                    </div>
                    <div className={listPageStyles.cardContent}>
                      <h3 className={listPageStyles.cardPatientName}>{a.patientName}</h3>
                      <p className={listPageStyles.cardPatientInfo}>
                        {a.gender ? `${a.gender}, ` : ""}{a.age ? `${a.age} yrs` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-50 space-y-2 text-xs text-emerald-800">
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-emerald-500" /> {a.mobile}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-500" /> {a.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-500" /> {a.time}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-900">₹{a.fees || a.fee || 0}</span>
                  <select
                    value={a.status || "Pending"}
                    onChange={(e) => updateStatus(a.id || a._id, e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}