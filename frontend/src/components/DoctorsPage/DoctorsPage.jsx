import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Star, MapPin, Calendar, Stethoscope, ChevronRight } from "lucide-react";
import { doctorsPageStyles } from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

export default function DoctorsPage() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

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
        name: d.name || "Doctor",
        specialization: d.specialization || "General Physician",
        image: d.imageUrl || d.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        experience: d.experience || "5+ years",
        fee: d.fee ?? 0,
        rating: d.rating || 4.8,
        location: d.location || "Hospital Main Campus",
        available: d.availability === "Available" || d.available === true,
        about: d.about || "",
        raw: d,
      }));
      setAllDoctors(normalized);
    } catch (err) {
      console.error("load doctors error:", err);
      setError("Network error while loading doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [API_BASE]);

  const specialties = useMemo(() => {
    const set = new Set(allDoctors.map((d) => d.specialization).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [allDoctors]);

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doctor) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        doctor.name.toLowerCase().includes(q) ||
        doctor.specialization.toLowerCase().includes(q) ||
        doctor.location.toLowerCase().includes(q);
      const matchSpec = selectedSpecialty === "All" || doctor.specialization === selectedSpecialty;
      return matchSearch && matchSpec;
    });
  }, [allDoctors, searchTerm, selectedSpecialty]);

  return (
    <div className={doctorsPageStyles.pageContainer || "min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8"}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Medical Faculty
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-emerald-950 mt-3">
            Find Experienced Doctors
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Connect with board-certified physicians, surgeons, and specialists across multiple hospital departments.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-emerald-100 mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSpecialty === spec
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-emerald-700 font-medium">
            Loading specialist doctors...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 p-8 max-w-lg mx-auto">
            <Stethoscope className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Doctors Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or specialty filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-amber-600 flex items-center gap-1 shadow-xs">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span>{doctor.rating}</span>
                    </div>
                    {!doctor.available && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-xs font-semibold shadow">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition">
                      {doctor.name}
                    </h3>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">{doctor.specialization}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {doctor.location}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" /> {doctor.experience} experience
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</span>
                      <p className="text-base font-extrabold text-emerald-900">₹{doctor.fee}</p>
                    </div>

                    <Link
                      to={`/doctors/${doctor.id}`}
                      state={{ doctor: doctor.raw }}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                    >
                      <span>Book Slot</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}