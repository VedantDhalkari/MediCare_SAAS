import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  BadgeIndianRupee,
  Search,
  Activity,
  HeartHandshake,
} from "lucide-react";
import { dashboardStyles as s } from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeDoctor(doc) {
  const id = doc._id || doc.id || String(Math.random()).slice(2);
  const name =
    doc.name ||
    doc.fullName ||
    `${doc.firstName || ""} ${doc.lastName || ""}`.trim() ||
    "Unknown Doctor";
  const specialization =
    doc.specialization ||
    doc.speciality ||
    (Array.isArray(doc.specializations)
      ? doc.specializations.join(", ")
      : "") ||
    "General";
  const fee = safeNumber(
    doc.fee ?? doc.fees ?? doc.consultationFee ?? doc.consultation_fee ?? 0,
    0
  );
  const image =
    doc.imageUrl ||
    doc.image ||
    doc.avatar ||
    `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80`;

  const appointments = {
    total:
      doc.appointments?.total ??
      doc.totalAppointments ??
      doc.appointmentsTotal ??
      0,
    completed:
      doc.appointments?.completed ??
      doc.completedAppointments ??
      doc.appointmentsCompleted ??
      0,
    canceled:
      doc.appointments?.canceled ??
      doc.canceledAppointments ??
      doc.appointmentsCanceled ??
      0,
  };

  let earnings = null;
  if (doc.earnings !== undefined && doc.earnings !== null)
    earnings = safeNumber(doc.earnings, 0);
  else if (doc.revenue !== undefined && doc.revenue !== null)
    earnings = safeNumber(doc.revenue, 0);
  else if (appointments.completed && fee)
    earnings = fee * safeNumber(appointments.completed, 0);
  else earnings = 0;

  return {
    id,
    name,
    specialization,
    fee,
    image,
    appointments,
    earnings,
    raw: doc,
  };
}

export default function DashboardPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/doctors?limit=200`;
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.message || `Failed to fetch doctors (${res.status})`
          );
        }
        const body = await res.json();
        let list = [];
        if (Array.isArray(body)) list = body;
        else if (Array.isArray(body.doctors)) list = body.doctors;
        else if (Array.isArray(body.data)) list = body.data;
        else if (Array.isArray(body.items)) list = body.items;
        else {
          const firstArray = Object.values(body).find((v) => Array.isArray(v));
          if (firstArray) list = firstArray;
        }
        const normalized = list.map((d) => normalizeDoctor(d));
        if (mounted) setDoctors(normalized);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        if (mounted) {
          setError(err.message || "Failed to load doctors");
          setDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  const totals = useMemo(() => {
    const totalDoctors = doctors.length;
    const totalAppointments = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.total, 0),
      0
    );
    const totalEarnings = doctors.reduce(
      (s, d) => s + safeNumber(d.earnings, 0),
      0
    );
    const completed = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.completed, 0),
      0
    );
    const canceled = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.canceled, 0),
      0
    );
    return {
      totalDoctors,
      totalAppointments,
      totalEarnings,
      completed,
      canceled,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!query) return doctors;
    const q = query.trim().toLowerCase();
    const qNum = Number(q);
    return doctors.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      if ((d.specialization || "").toLowerCase().includes(q)) return true;
      if (d.fee.toString().includes(q)) return true;
      if (!Number.isNaN(qNum) && d.fee <= qNum) return true;
      return false;
    });
  }, [doctors, query]);

  const INITIAL_COUNT = 8;
  const visibleDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, INITIAL_COUNT);

  return (
    <div className={s.pageContainer}>
      <div className={s.maxWidthContainer}>
        {/* Header */}
        <div className={s.headerContainer}>
          <div>
            <h1 className={s.headerTitle}>Hospital Executive Overview</h1>
            <p className={s.headerSubtitle}>
              Live analytics across doctors, appointments, and earnings backed by PostgreSQL.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className={s.statLabel}>Total Doctors</p>
                <p className={s.statValue}>{totals.totalDoctors}</p>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className={s.statLabel}>Appointments</p>
                <p className={s.statValue}>{totals.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className={s.statLabel}>Completed</p>
                <p className={s.statValue}>{totals.completed}</p>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className={s.statLabel}>Canceled</p>
                <p className={s.statValue}>{totals.canceled}</p>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <BadgeIndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className={s.statLabel}>Total Earnings</p>
                <p className={s.statValue}>₹ {totals.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className={s.searchContainer}>
            <div className={s.searchInputContainer}>
              <Search className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search doctor or specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={s.searchInput}
              />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className={s.clearButton}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Doctors Table */}
        <div className={s.tableContainer}>
          <div className={s.tableHeader}>
            <h2 className={s.tableTitle}>Registered Doctors & Performance</h2>
            <span className={s.tableCount}>
              Showing {visibleDoctors.length} of {filteredDoctors.length} doctors
            </span>
          </div>

          {error && <div className={s.errorContainer}>{error}</div>}

          {loading ? (
            <div className="text-center py-12 text-emerald-600 font-medium">
              Loading analytics from PostgreSQL...
            </div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.tableHead}>
                  <tr>
                    <th className={s.tableHeaderCell}>Doctor</th>
                    <th className={s.tableHeaderCell}>Specialization</th>
                    <th className={s.tableHeaderCell}>Fee</th>
                    <th className={s.tableHeaderCell}>Appointments</th>
                    <th className={s.tableHeaderCell}>Completed</th>
                    <th className={s.tableHeaderCell}>Canceled</th>
                    <th className={s.tableHeaderCell}>Total Earnings</th>
                  </tr>
                </thead>

                <tbody className={s.tableBody}>
                  {visibleDoctors.map((d, idx) => (
                    <tr
                      key={d.id}
                      className={
                        s.tableRow +
                        " " +
                        (idx % 2 === 0 ? s.tableRowEven : s.tableRowOdd)
                      }
                    >
                      <td className={s.tableCell + " " + s.tableCellFlex}>
                        <div className={s.verticalLine} />
                        <img
                          src={d.image}
                          alt={d.name}
                          className={s.doctorImage}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div>
                          <div className={s.doctorName}>{d.name}</div>
                          <div className={s.doctorId}>ID: {d.id}</div>
                        </div>
                      </td>

                      <td className={s.tableCell + " " + s.doctorSpecialization}>
                        {d.specialization}
                      </td>

                      <td className={s.tableCell + " " + s.feeText}>
                        ₹ {d.fee}
                      </td>

                      <td className={s.tableCell + " " + s.appointmentsText}>
                        {d.appointments.total}
                      </td>

                      <td className={s.tableCell + " " + s.completedText}>
                        {d.appointments.completed}
                      </td>

                      <td className={s.tableCell + " " + s.canceledText}>
                        {d.appointments.canceled}
                      </td>

                      <td className={s.tableCell + " " + s.earningsText}>
                        ₹ {d.earnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Doctor Cards */}
          <div className={s.mobileDoctorContainer}>
            <div className={s.mobileDoctorGrid}>
              {visibleDoctors.map((d) => (
                <div key={d.id} className={s.mobileDoctorCard}>
                  <div className={s.mobileDoctorHeader}>
                    <div className="flex items-center gap-3">
                      <img
                        src={d.image}
                        alt={d.name}
                        className={s.mobileDoctorImage}
                      />
                      <div>
                        <h4 className={s.mobileDoctorName}>{d.name}</h4>
                        <p className={s.mobileDoctorSpecialization}>
                          {d.specialization}
                        </p>
                      </div>
                    </div>
                    <span className={s.mobileDoctorFee}>₹ {d.fee}</span>
                  </div>

                  <div className={s.mobileStatsGrid}>
                    <div>
                      <p className={s.mobileStatLabel}>Appointments</p>
                      <p className={s.mobileStatValue}>{d.appointments.total}</p>
                    </div>
                    <div>
                      <p className={s.mobileStatLabel}>Completed</p>
                      <p className={s.mobileStatValue}>{d.appointments.completed}</p>
                    </div>
                    <div>
                      <p className={s.mobileStatLabel}>Canceled</p>
                      <p className={s.mobileStatValue}>{d.appointments.canceled}</p>
                    </div>
                  </div>

                  <div className={s.mobileEarningsContainer}>
                    <span className="font-semibold text-emerald-800">Earnings:</span>
                    <span className="font-bold text-emerald-700">₹ {d.earnings.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredDoctors.length > INITIAL_COUNT && (
            <div className={s.showMoreContainer}>
              <button
                onClick={() => setShowAll(!showAll)}
                className={s.showMoreButton}
              >
                {showAll ? "Show Less" : `View All Doctors (${filteredDoctors.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
