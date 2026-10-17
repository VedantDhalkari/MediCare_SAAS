import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  User,
  Activity,
  Calendar,
} from "lucide-react";
import {
  appointmentPageStyles,
  cardStyles,
  badgeStyles,
  iconSize,
} from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

function pad(n) {
  return String(n ?? 0).padStart(2, "0");
}

export default function AppointmentPage() {
  const [activeTab, setActiveTab] = useState("doctors");
  const [doctorAppts, setDoctorAppts] = useState([]);
  const [serviceAppts, setServiceAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resDoc, resSrv] = await Promise.all([
        fetch(`${API_BASE}/api/appointments`),
        fetch(`${API_BASE}/api/service-appointments`),
      ]);

      const jsonDoc = await resDoc.json().catch(() => null);
      const jsonSrv = await resSrv.json().catch(() => null);

      const docs = (jsonDoc && (jsonDoc.appointments || jsonDoc.data || jsonDoc)) || [];
      const srvs = (jsonSrv && (jsonSrv.appointments || jsonSrv.data || jsonSrv)) || [];

      setDoctorAppts(Array.isArray(docs) ? docs : []);
      setServiceAppts(Array.isArray(srvs) ? srvs : []);
    } catch (err) {
      console.error("loadAppointments error:", err);
      setError("Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const StatusBadge = ({ itemStatus }) => {
    if (itemStatus === "Completed")
      return (
        <span className={badgeStyles.statusBadge.completed}>
          <CheckCircle className={iconSize.small} /> Completed
        </span>
      );
    if (itemStatus === "Confirmed")
      return (
        <span className={badgeStyles.statusBadge.confirmed}>
          <Bell className={iconSize.small} /> Confirmed
        </span>
      );
    if (itemStatus === "Canceled")
      return (
        <span className={badgeStyles.statusBadge.canceled}>
          <XCircle className={iconSize.small} /> Canceled
        </span>
      );
    return (
      <span className={badgeStyles.statusBadge.pending}>
        <Clock className={iconSize.small} /> {itemStatus || "Pending"}
      </span>
    );
  };

  const PaymentBadge = ({ payment }) => {
    const isPaid = payment?.status === "Paid";
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
          isPaid
            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
            : "bg-amber-50 text-amber-700 border-amber-300"
        }`}
      >
        {isPaid ? "Paid" : "Cash / Pending"}
      </span>
    );
  };

  return (
    <div className={appointmentPageStyles.pageContainer}>
      <div className={appointmentPageStyles.maxWidthContainer}>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
            Appointments & Bookings
          </h1>
          <p className="text-slate-600 mt-2">
            Track and view your scheduled doctor consultations and healthcare service tests.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex mt-6 p-1.5 bg-emerald-100 rounded-full border border-emerald-200">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                activeTab === "doctors"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-emerald-800 hover:text-emerald-900"
              }`}
            >
              Doctor Appointments ({doctorAppts.length})
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                activeTab === "services"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-emerald-800 hover:text-emerald-900"
              }`}
            >
              Diagnostic Services ({serviceAppts.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-emerald-700 font-medium">
            Loading scheduled appointments...
          </div>
        ) : activeTab === "doctors" ? (
          doctorAppts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm max-w-xl mx-auto">
              <Calendar className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900">No Doctor Appointments Yet</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                You haven't scheduled any doctor consultation. Book one now!
              </p>
              <Link
                to="/doctors"
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-full shadow hover:bg-emerald-700 transition"
              >
                Browse Doctors
              </Link>
            </div>
          ) : (
            <div className={appointmentPageStyles.doctorGrid}>
              {doctorAppts.map((appt) => (
                <div key={appt.id || appt._id} className={cardStyles.doctorCard}>
                  <div className={cardStyles.doctorImageContainer}>
                    <img
                      src={
                        appt.doctorImage?.url ||
                        appt.imageUrl ||
                        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={appt.doctorName || "Doctor"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-emerald-900 mt-4 text-center">
                    {appt.doctorName || "Specialist Doctor"}
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold">{appt.speciality || "General"}</p>

                  <div className="w-full border-t border-emerald-100 my-3 pt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Patient:</span>
                      <span className="font-semibold text-slate-800">{appt.patientName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Date:</span>
                      <span className="font-semibold text-slate-800">{appt.date}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Time:</span>
                      <span className="font-semibold text-slate-800">{appt.time}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Fee:</span>
                      <span className="font-bold text-emerald-700">₹{appt.fees || appt.fee || 0}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <PaymentBadge payment={appt.payment} />
                    <StatusBadge itemStatus={appt.status} />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : serviceAppts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm max-w-xl mx-auto">
            <Activity className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-teal-900">No Service Appointments Yet</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              You haven't scheduled any diagnostic checkups or lab tests.
            </p>
            <Link
              to="/services"
              className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-full shadow hover:bg-teal-700 transition"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className={appointmentPageStyles.serviceGrid}>
            {serviceAppts.map((srv) => (
              <div key={srv.id || srv._id} className={cardStyles.serviceCard}>
                <div className={cardStyles.serviceImageContainer}>
                  <img
                    src={
                      srv.serviceImage?.url ||
                      srv.imageUrl ||
                      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={srv.serviceName || "Service"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-lg font-bold text-teal-900 mt-4 text-center">
                  {srv.serviceName || "Diagnostic Test"}
                </h3>
                <p className="text-sm font-bold text-teal-700 mt-1">₹{srv.fees || srv.price || 0}</p>

                <div className="w-full border-t border-teal-100 my-3 pt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex justify-between">
                    <span className="font-medium text-slate-500">Patient:</span>
                    <span className="font-semibold text-slate-800">{srv.patientName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-slate-500">Date:</span>
                    <span className="font-semibold text-slate-800">{srv.date}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-slate-500">Time:</span>
                    <span className="font-semibold text-slate-800">{srv.time}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <PaymentBadge payment={srv.payment} />
                  <StatusBadge itemStatus={srv.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}