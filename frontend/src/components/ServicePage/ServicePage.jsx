import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronsRight, MousePointer2Off, Activity } from "lucide-react";
import { serviceCardStyles, servicePageStyles } from "../../assets/dummyStyles";

const PlaceholderImg = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80";

const ServiceCard = ({ service }) => {
  const src = service.imageUrl || service.image || PlaceholderImg;
  const name = service.name || "Healthcare Service";
  const shortDescription = service.shortDescription || service.about || "";

  return (
    <div className={serviceCardStyles.card}>
      <div className={serviceCardStyles.imageContainer}>
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={serviceCardStyles.fallbackImage}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PlaceholderImg;
          }}
        />
      </div>

      <div className={serviceCardStyles.content}>
        <h3 className={serviceCardStyles.serviceName}>{name}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 my-2">{shortDescription}</p>
        <p className="text-sm font-bold text-teal-700 mb-3">₹{service.price}</p>

        <div className={serviceCardStyles.buttonContainer}>
          {service.available ? (
            <Link
              to={`/services/${service.id}`}
              state={{ service: service.raw || service }}
              className={serviceCardStyles.buttonAvailable}
            >
              <ChevronsRight className="w-4 h-4" /> Book Now
            </Link>
          ) : (
            <button disabled className={serviceCardStyles.buttonUnavailable}>
              <MousePointer2Off className="w-4 h-4" /> Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ServicePage({ previewCount = 50 }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/services`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || `Failed to load services (${res.status})`);
      }

      const items = (json && (json.data || json.services || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((s) => ({
        id: s._id || s.id,
        name: s.name || s.title || "Service",
        shortDescription: s.shortDescription || s.about || "",
        image: s.imageUrl || s.image || PlaceholderImg,
        price: s.price ?? s.fee ?? 0,
        available: s.available !== false && s.availability !== "unavailable",
        raw: s,
      }));

      setServices(normalized);
    } catch (err) {
      console.error("load services error:", err);
      setError("Network error while loading healthcare services.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, [API_BASE]);

  const shown = services.slice(0, previewCount);

  return (
    <div className={servicePageStyles.pageContainer}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-900">
            Comprehensive Diagnostic Services
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Book full body checkups, specialized diagnostic tests, scans, and laboratory consultations with fast reporting.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-teal-700 font-medium">
            Loading available healthcare services...
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-teal-100 shadow-sm max-w-xl mx-auto">
            <Activity className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-teal-900">No Services Available</h3>
            <p className="text-slate-500 text-sm mt-1">Please check back soon for updated diagnostic listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shown.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}