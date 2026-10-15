import os

list_page_code = '''import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Star,
  ChevronDown,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  BadgeIndianRupee,
} from "lucide-react";
import { doctorListStyles } from "../../assets/dummyStyles";

function formatDateISO(iso) {
  if (!iso || typeof iso !== "string") return iso;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = String(Number(d));
  const month = monthNames[dateObj.getMonth()] || "";
  return `${day} ${month} ${y}`;
}

function normalizeToDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
}

function buildScheduleMap(schedule) {
  const map = {};
  if (!schedule || typeof schedule !== "object") return map;
  Object.entries(schedule).forEach(([k, v]) => {
    const nd = normalizeToDateString(k) || String(k);
    map[nd] = Array.isArray(v) ? v.slice() : [];
  });
  return map;
}

function getSortedScheduleDates(scheduleLike) {
  let keys = [];
  if (Array.isArray(scheduleLike)) {
    keys = scheduleLike.map(normalizeToDateString).filter(Boolean);
  } else if (scheduleLike && typeof scheduleLike === "object") {
    keys = Object.keys(scheduleLike).map(normalizeToDateString).filter(Boolean);
  }

  keys = Array.from(new Set(keys));
  const parsed = keys.map((ds) => ({ ds, date: new Date(ds) }));
  const dateVal = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  const today = new Date();
  const todayVal = dateVal(today);

  const past = parsed
    .filter((p) => dateVal(p.date) < todayVal)
    .sort((a, b) => dateVal(b.date) - dateVal(a.date));

  const future = parsed
    .filter((p) => dateVal(p.date) >= todayVal)
    .sort((a, b) => dateVal(a.date) - dateVal(b.date));

  return [...past, ...future].map((p) => p.ds);
}

export default function ListPage() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [doctors, setDoctors] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      setIsMobileScreen(window.innerWidth < 640);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const body = await res.json().catch(() => null);

      if (res.ok && body && (body.success || Array.isArray(body))) {
        const list = Array.isArray(body.data)
          ? body.data
          : Array.isArray(body.doctors)
          ? body.doctors
          : Array.isArray(body)
          ? body
          : [];
        const normalized = list.map((d) => {
          const scheduleMap = buildScheduleMap(d.schedule || {});
          return {
            ...d,
            schedule: scheduleMap,
          };
        });
        setDoctors(normalized);
      } else {
        console.error("Failed to fetch doctors", { status: res.status, body });
        setDoctors([]);
      }
    } catch (err) {
      console.error("Network error fetching doctors", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = doctors;
    if (filterStatus === "available") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() === "available"
      );
    } else if (filterStatus === "unavailable") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() !== "available"
      );
    }
    if (!q) return list;
    return list.filter((d) => {
      return (
        (d.name || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q)
      );
    });
  }, [doctors, query, filterStatus]);

  const displayed = useMemo(() => {
    if (showAll) return filtered;
    return filtered.slice(0, 6);
  }, [filtered, showAll]);

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function removeDoctor(id) {
    const doc = doctors.find((d) => (d._id || d.id) === id);
    if (!doc) return;
    const ok = window.confirm(`Delete ${doc.name}? This will remove it permanently from PostgreSQL.`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        alert(body?.message || "Failed to delete");
        return;
      }
      setDoctors((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Network error deleting doctor");
    }
  }

  function applyStatusFilter(status) {
    setFilterStatus((prev) => (prev === status ? "all" : status));
    setExpanded(null);
    setShowAll(false);
  }

  return (
    <div className={doctorListStyles.container}>
      <div className={doctorListStyles.headerContainer}>
        <div className={doctorListStyles.headerTopSection}>
          <div className={doctorListStyles.headerIconContainer}>
            <div className={doctorListStyles.headerIcon}>
              <Users className={doctorListStyles.headerIconSvg} size={24} />
            </div>
            <div>
              <h1 className={doctorListStyles.headerTitle}>Hospital Doctors Directory</h1>
              <p className={doctorListStyles.headerSubtitle}>
                Manage doctor records, consultation rates, and active schedules (PostgreSQL DB)
              </p>
            </div>
          </div>

          <div className={doctorListStyles.headerSearchContainer}>
            <div className={doctorListStyles.searchBox}>
              <Search size={18} className={doctorListStyles.searchIcon} />
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={doctorListStyles.searchInput}
              />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className={doctorListStyles.clearButton}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className={doctorListStyles.filterContainer}>
          <button
            onClick={() => applyStatusFilter("all")}
            className={doctorListStyles.filterButton(filterStatus === "all", "emerald")}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            onClick={() => applyStatusFilter("available")}
            className={doctorListStyles.filterButton(filterStatus === "available", "emerald")}
          >
            Available Only
          </button>
          <button
            onClick={() => applyStatusFilter("unavailable")}
            className={doctorListStyles.filterButton(filterStatus === "unavailable", "red")}
          >
            Unavailable
          </button>
        </div>
      </div>

      {loading ? (
        <div className={doctorListStyles.loadingContainer}>
          Loading doctors from PostgreSQL database...
        </div>
      ) : displayed.length === 0 ? (
        <div className={doctorListStyles.noResultsContainer}>
          No doctors found matching your criteria.
        </div>
      ) : (
        <div className={doctorListStyles.gridContainer}>
          {displayed.map((doc) => {
            const id = doc._id || doc.id;
            const isOpen = expanded === id;
            const isAvail = (doc.availability || "").toLowerCase() === "available";
            const scheduleMap = doc.schedule || {};
            const sortedDates = getSortedScheduleDates(scheduleMap);

            return (
              <article key={id} className={doctorListStyles.article}>
                <div className={doctorListStyles.articleContent}>
                  <img
                    src={doc.imageUrl || doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                    alt={doc.name}
                    className={doctorListStyles.doctorImage}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                    }}
                  />

                  <div className={doctorListStyles.doctorInfoContainer}>
                    <div className={doctorListStyles.doctorHeader}>
                      <div>
                        <h3 className={doctorListStyles.doctorName}>{doc.name}</h3>
                        <span className={doctorListStyles.availabilityBadge(isAvail)}>
                          <span className={doctorListStyles.availabilityDot(isAvail)} />
                          {isAvail ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className={doctorListStyles.ratingContainer}>
                        <div className={doctorListStyles.rating}>
                          <Star size={16} className="text-amber-500 fill-amber-500" />
                          <span>{doc.rating || "5.0"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          className={doctorListStyles.toggleButton(isOpen)}
                          aria-label="Toggle details"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>

                    <p className={doctorListStyles.doctorDetails}>
                      {doc.specialization} • {doc.experience} Experience
                    </p>

                    <div className={doctorListStyles.statsContainer}>
                      <div className={doctorListStyles.actionContainer}>
                        <div className="flex items-center gap-1">
                          <span className={doctorListStyles.feesLabel}>₹</span>
                          <span className={doctorListStyles.feesValue}>{doc.fee} Fee</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoctor(id)}
                          className={doctorListStyles.deleteButton}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={doctorListStyles.expandableContent}
                  style={{
                    maxHeight: isOpen ? (isMobileScreen ? 320 : 600) : 0,
                    transition:
                      "max-height 420ms cubic-bezier(.2,.9,.2,1), padding 220ms ease",
                    paddingTop: isOpen ? 16 : 0,
                    paddingBottom: isOpen ? 16 : 0,
                  }}
                >
                  {isOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={doctorListStyles.aboutSection}>
                        <h4 className={doctorListStyles.aboutHeading}>About</h4>
                        <p className={doctorListStyles.aboutText}>{doc.about}</p>

                        <div className="mt-4">
                          <div className={doctorListStyles.qualificationsHeading}>
                            Qualifications
                          </div>
                          <div className={doctorListStyles.qualificationsText}>
                            {doc.qualifications}
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className={doctorListStyles.scheduleHeading}>
                            Consultation Slots
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {sortedDates.length === 0 ? (
                              <span className="text-xs text-slate-400">No active slots scheduled</span>
                            ) : (
                              sortedDates.map((date) => {
                                const slots = scheduleMap[date] || [];
                                return (
                                  <div key={date} className="min-w-full md:min-w-0">
                                    <div className={doctorListStyles.scheduleDate}>
                                      {formatDateISO(date)}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                      {slots.map((s, i) => (
                                        <span
                                          key={i}
                                          className={doctorListStyles.scheduleSlot}
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      <aside className={doctorListStyles.statsSidebar}>
                        <div className={doctorListStyles.statsItemHeading}>
                          Success
                        </div>
                        <div className={doctorListStyles.statsItemValue}>
                          {doc.success}%
                        </div>

                        <div className={doctorListStyles.statsItemHeading}>
                          Patients
                        </div>
                        <div className={doctorListStyles.statsItemValue}>
                          {doc.patients}
                        </div>

                        <div className={doctorListStyles.statsItemHeading}>
                          Location
                        </div>
                        <div className={doctorListStyles.locationValue}>
                          {doc.location}
                        </div>
                      </aside>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filtered.length > 6 && (
        <div className={doctorListStyles.showMoreContainer}>
          <button
            onClick={() => setShowAll(!showAll)}
            className={doctorListStyles.showMoreButton}
          >
            {showAll ? "Show Less" : `View All Doctors (${filtered.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
'''

with open('admin/src/components/ListPage/ListPage.jsx', 'w', encoding='utf-8') as f:
    f.write(list_page_code)
print("ListPage.jsx written successfully")
