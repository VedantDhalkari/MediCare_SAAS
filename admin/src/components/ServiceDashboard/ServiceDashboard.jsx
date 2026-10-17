import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Grid,
  Search,
  BadgeIndianRupee,
  Layers,
  Sparkles,
} from "lucide-react";
import { serviceDashboardStyles } from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

function normalizeService(doc) {
  if (!doc) return null;
  const id = doc._id || doc.id || String(Math.random()).slice(2);
  const name = doc.name || doc.title || doc.serviceName || "Untitled Service";
  const price =
    Number(doc.price ?? doc.fee ?? doc.fees ?? doc.cost ?? doc.amount) || 0;
  const image =
    doc.imageUrl ||
    doc.image ||
    doc.avatar ||
    `https://i.pravatar.cc/150?u=${id}`;
  // various possible stat shapes
  const totalAppointments =
    doc.totalAppointments ??
    doc.appointments?.total ??
    doc.count ??
    doc.stats?.total ??
    doc.bookings ??
    0;
  const completed =
    doc.completed ??
    doc.appointments?.completed ??
    doc.stats?.completed ??
    doc.completedAppointments ??
    0;
  const canceled =
    doc.canceled ??
    doc.appointments?.canceled ??
    doc.stats?.canceled ??
    doc.canceledAppointments ??
    0;

  return {
    id,
    name,
    price,
    image,
    totalAppointments: Number(totalAppointments) || 0,
    completed: Number(completed) || 0,
    canceled: Number(canceled) || 0,
    raw: doc,
  };
}

export default function ServiceDashboard({ services: servicesProp = null }) {
  const [services, setServices] = useState(
    Array.isArray(servicesProp) ? servicesProp.map(normalizeService) : [],
  );
  const [loading, setLoading] = useState(!Array.isArray(servicesProp));
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const pollHandleRef = useRef(null);

  function buildFetchOptions() {
    const opts = {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const token = localStorage.getItem("authToken");
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    return opts;
  }

  async function fetchServices({ showLoading = true } = {}) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      const url = `${API_BASE}/api/service-appointments/stats/summary`;
      const res = await fetch(url, buildFetchOptions());
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Failed to fetch services (${res.status})`,
        );
      }
      const body = await res.json();

      let list = [];
      if (Array.isArray(body)) list = body;
      else if (Array.isArray(body.services)) list = body.services;
      else if (Array.isArray(body.data)) list = body.data;
      else if (Array.isArray(body.items)) list = body.items;
      else {
        const maybeArray = Object.values(body).find((v) => Array.isArray(v));
        if (maybeArray) list = maybeArray;
      }

      const normalized = (list || []).map(normalizeService).filter(Boolean);
      if (mountedRef.current) {
        setServices(normalized);
        setError(null);
      }
    } catch (err) {
      console.error("Service fetch error:", err);
      if (mountedRef.current) {
        setError(err.message || "Failed to load services");

      }
    } finally {
      if (mountedRef.current && showLoading) setLoading(false);
      fetchingRef.current = false;
    }
  }

  useEffect(() => {
    window.refreshServices = () => fetchServices({ showLoading: true });
    return () => {
      try {
        delete window.refreshServices;
      } catch {}
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (Array.isArray(servicesProp)) {
      setServices(servicesProp.map(normalizeService));
      setLoading(false);
      return () => {
        mountedRef.current = false;
      };
    }

    fetchServices({ showLoading: true });
    function startPolling() {
      if (pollHandleRef.current) return;
      pollHandleRef.current = setInterval(() => {
        if (document.visibilityState === "visible")
          fetchServices({ showLoading: false });
      }, 10000);
    }

    function stopPolling() {
      if (pollHandleRef.current) {
        clearInterval(pollHandleRef.current);
        pollHandleRef.current = null;
      }
    }

    startPolling();

    function onFocus() {
      fetchServices({ showLoading: false });
    }
    window.addEventListener("focus", onFocus);

    function onServicesUpdated() {
      fetchServices({ showLoading: false });
    }
    window.addEventListener("services:updated", onServicesUpdated);

    function onStorage(e) {
      if (e?.key === "service_bookings_updated") {
        fetchServices({ showLoading: false });
      }
    }
    window.addEventListener("storage", onStorage);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchServices({ showLoading: false });
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      mountedRef.current = false;
      stopPolling();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("services:updated", onServicesUpdated);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [servicesProp]);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;
    const qNum = Number(q);
    return services.filter((s) => {
      if (s.name.toLowerCase().includes(q)) return true;
      if (!Number.isNaN(qNum) && s.price <= qNum) return true;
      if (s.price.toString().includes(q)) return true;
      return false;
    });
  }, [services, searchQuery]);

  const INITIAL_COUNT = 8;
  const visibleServices = showAll
    ? filteredServices
    : filteredServices.slice(0, INITIAL_COUNT);

  const totals = useMemo(() => {
    return filteredServices.reduce(
      (acc, s) => {
        acc.totalServices += 1;
        acc.totalAppointments += s.totalAppointments;
        acc.totalCompleted += s.completed;
        acc.totalCanceled += s.canceled;
        acc.totalEarning += s.completed * s.price;
        return acc;
      },
      {
        totalServices: 0,
        totalAppointments: 0,
        totalCompleted: 0,
        totalCanceled: 0,
        totalEarning: 0,
      },
    );
  }, [filteredServices]);

  function formatCurrency(v) {
    return `₹${Number(v || 0).toLocaleString()}`;
  }

  return (
    <div className={serviceDashboardStyles.container}>
      <div className={serviceDashboardStyles.innerContainer}>
        {/* Header */}
        <div className={serviceDashboardStyles.header.container}>
          <div>
            <h1 className={serviceDashboardStyles.header.title}>Service Performance Dashboard</h1>
            <p className={serviceDashboardStyles.header.subtitle}>
              Hospital health checkups and diagnostic test metrics backed by PostgreSQL.
            </p>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className={serviceDashboardStyles.statGrid}>
          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Services</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalServices}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Bookings</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalAppointments}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Completed</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalCompleted}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <XCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Canceled</p>
              <p className={serviceDashboardStyles.statCard.value}>{totals.totalCanceled}</p>
            </div>
          </div>

          <div className={serviceDashboardStyles.statCard.container}>
            <div className={serviceDashboardStyles.statCard.iconContainer}>
              <BadgeIndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className={serviceDashboardStyles.statCard.label}>Total Revenue</p>
              <p className={serviceDashboardStyles.statCard.value}>{formatCurrency(totals.totalEarning)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={serviceDashboardStyles.search.container}>
          <div className={serviceDashboardStyles.search.inputContainer}>
            <Search size={16} className="text-emerald-500" />
            <input
              type="text"
              placeholder="Search diagnostic service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={serviceDashboardStyles.search.input}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className={serviceDashboardStyles.table.container}>
          {/* Tablet Header */}
          <div className={serviceDashboardStyles.table.headerMd}>
            <div className={serviceDashboardStyles.table.headerText}>Service</div>
            <div className={serviceDashboardStyles.table.headerText}>Appointments</div>
            <div className={serviceDashboardStyles.table.headerText}>Completed</div>
            <div className={serviceDashboardStyles.table.headerText}>Canceled</div>
            <div className={serviceDashboardStyles.table.headerText}>Earning</div>
          </div>

          {/* Desktop Header */}
          <div className={serviceDashboardStyles.table.headerLg}>
            <div className="col-span-5">Service</div>
            <div className="col-span-2">Price</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Appointments</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Completed</div>
            <div className={serviceDashboardStyles.table.headerTextLg(1)}>Canceled</div>
            <div className="col-span-2 text-right">Earning</div>
          </div>

          {loading ? (
            <div className={serviceDashboardStyles.states.loading}>
              Loading diagnostic services from PostgreSQL...
            </div>
          ) : error ? (
            <div className={serviceDashboardStyles.states.error}>
              {error}
            </div>
          ) : visibleServices.length === 0 ? (
            <div className={serviceDashboardStyles.states.empty}>
              No services found matching your criteria.
            </div>
          ) : (
            <div className={serviceDashboardStyles.table.body}>
              {visibleServices.map((s) => {
                const earning = s.completed * s.price;
                return (
                  <div key={s.id} className={serviceDashboardStyles.table.row}>
                    {/* Desktop View */}
                    <div className={serviceDashboardStyles.table.desktopView}>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={serviceDashboardStyles.table.desktopImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <h3 className={serviceDashboardStyles.table.desktopServiceName}>
                            {s.name}
                          </h3>
                        </div>
                      </div>

                      <div className="col-span-2 font-medium text-slate-700">
                        {formatCurrency(s.price)}
                      </div>

                      <div className={serviceDashboardStyles.table.desktopCenterCell(1)}>
                        {s.totalAppointments}
                      </div>

                      <div className={`${serviceDashboardStyles.table.desktopCenterCell(1)} text-emerald-700 font-medium`}>
                        {s.completed}
                      </div>

                      <div className={`${serviceDashboardStyles.table.desktopCenterCell(1)} text-rose-500`}>
                        {s.canceled}
                      </div>

                      <div className="col-span-2 text-right font-bold text-emerald-800">
                        {formatCurrency(earning)}
                      </div>
                    </div>

                    {/* Tablet View */}
                    <div className={serviceDashboardStyles.table.tabletView}>
                      <div className="flex items-center gap-3">
                        <div className={serviceDashboardStyles.table.tabletImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={serviceDashboardStyles.table.tabletTextContainer}>
                          <div className={serviceDashboardStyles.table.tabletServiceName}>
                            {s.name}
                          </div>
                          <div className={serviceDashboardStyles.table.tabletPrice}>
                            {formatCurrency(s.price)}
                          </div>
                        </div>
                      </div>

                      <div className={serviceDashboardStyles.table.tabletCell}>
                        {s.totalAppointments}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-emerald-700`}>
                        {s.completed}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-red-500`}>
                        {s.canceled}
                      </div>
                      <div className={`${serviceDashboardStyles.table.tabletCell} text-right font-bold text-emerald-800`}>
                        {formatCurrency(earning)}
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className={serviceDashboardStyles.table.mobileView}>
                      <div className="flex items-start gap-3">
                        <div className={serviceDashboardStyles.table.mobileImage}>
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={serviceDashboardStyles.table.mobileServiceHeader}>
                            <h3 className={serviceDashboardStyles.table.mobileServiceName}>
                              {s.name}
                            </h3>
                            <div className="text-sm font-medium">
                              {formatCurrency(s.price)}
                            </div>
                          </div>

                          <div className={serviceDashboardStyles.table.mobileStatsContainer}>
                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <Calendar size={14} />
                              <span className="leading-none">
                                {s.totalAppointments} Appointments
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <CheckCircle size={14} />
                              <span className="leading-none text-emerald-700">
                                {s.completed} Completed
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("red")}>
                              <XCircle size={14} />
                              <span className="leading-none text-red-500">
                                {s.canceled} Canceled
                              </span>
                            </div>

                            <div className={serviceDashboardStyles.table.mobileStatItem("emerald")}>
                              <BadgeIndianRupee size={14} />
                              <span className="leading-none font-bold text-emerald-800">
                                Total Earning: {formatCurrency(earning)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredServices.length > INITIAL_COUNT && (
            <div className={serviceDashboardStyles.showMore.container}>
              <button
                onClick={() => setShowAll(!showAll)}
                className={serviceDashboardStyles.showMore.button}
              >
                {showAll ? "Show Less" : `View All Services (${filteredServices.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
