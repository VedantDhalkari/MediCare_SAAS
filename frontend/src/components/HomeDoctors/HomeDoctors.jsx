import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeDoctorsStyles } from "../../assets/dummyStyles";

export default function HomeDoctors({ previewCount = 8 }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to load doctors (${res.status})`);
      }
      const items = (json && (json.data || json.doctors || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((d) => ({
        id: d._id || d.id,
        name: d.name || "Unknown",
        specialization: d.specialization || "Specialist",
        image: d.imageUrl || d.image || "/placeholder-doctor.jpg",
        experience: d.experience || "",
        fee: d.fee ?? 0,
        available: d.availability === "Available" || d.available === true,
        raw: d,
      }));
      setDoctors(normalized);
    } catch (err) {
      console.error("load doctors error:", err);
      setError("Network error while loading doctors.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [API_BASE]);

  const preview = doctors.slice(0, previewCount);

  return (
    <section className={homeDoctorsStyles.section}>
      <div className={homeDoctorsStyles.container}>
        <div className={homeDoctorsStyles.header}>
          <h2 className={homeDoctorsStyles.title}>
            Top <span className={homeDoctorsStyles.titleSpan}>Specialist Doctors</span>
          </h2>
          <p className={homeDoctorsStyles.subtitle}>
            Book appointment with our verified, experienced specialists.
          </p>
        </div>

        {error && (
          <div className={homeDoctorsStyles.errorContainer}>
            <div className={homeDoctorsStyles.errorText}>{error}</div>
            <button onClick={loadDoctors} className={homeDoctorsStyles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className={homeDoctorsStyles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={homeDoctorsStyles.skeletonCard}>
                <div className={homeDoctorsStyles.skeletonImage} />
                <div className={homeDoctorsStyles.skeletonText1} />
                <div className={homeDoctorsStyles.skeletonText2} />
                <div className={homeDoctorsStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : (
          <div className={homeDoctorsStyles.doctorsGrid}>
            {preview.map((doctor) => (
              <article key={doctor.id} className={homeDoctorsStyles.article}>
                <div
                  className={
                    doctor.available
                      ? homeDoctorsStyles.imageContainerAvailable
                      : homeDoctorsStyles.imageContainerUnavailable
                  }
                >
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    loading="lazy"
                    className={homeDoctorsStyles.image}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  {!doctor.available && (
                    <span className={homeDoctorsStyles.unavailableBadge}>Unavailable</span>
                  )}
                </div>

                <div className={homeDoctorsStyles.cardBody}>
                  <h3 className={homeDoctorsStyles.doctorName}>{doctor.name}</h3>
                  <p className={homeDoctorsStyles.specialization}>{doctor.specialization}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100">
                    <span className="text-sm font-bold text-emerald-800">₹{doctor.fee}</span>
                    <Link
                      to={`/doctors/${doctor.id}`}
                      state={{ doctor: doctor.raw }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            to="/doctors"
            className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg transition-all"
          >
            View All Doctors
          </Link>
        </div>
      </div>
    </section>
  );
}