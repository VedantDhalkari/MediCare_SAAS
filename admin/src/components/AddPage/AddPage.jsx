import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Calendar, CheckCircle, XCircle, Eye, EyeOff, UserPlus, X } from "lucide-react";
import { doctorDetailStyles as s } from "../../assets/dummyStyles";
import { API_BASE } from "../../apiConfig";

function timeStringToMinutes(t) {
  if (!t) return 0;
  const [hhmm, ampm] = t.split(" ");
  let [h, m] = hhmm.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function formatDateISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = String(Number(d));
  const month = monthNames[dateObj.getMonth()] || "";
  return `${day} ${month} ${y}`;
}

export default function AddPage() {
  const [doctorList, setDoctorList] = useState([]);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    imageFile: null,
    imagePreview: "",
    experience: "",
    qualifications: "",
    location: "",
    about: "",
    fee: "",
    success: "",
    patients: "",
    rating: "",
    schedule: {},
    availability: "Available",
    email: "",
    password: "",
  });

  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState("");
  const [slotMinute, setSlotMinute] = useState("00");
  const [slotAmpm, setSlotAmpm] = useState("AM");

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [today] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  function handleImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (form.imagePreview && form.imageFile) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch (err) {}
    }
    setForm((p) => ({
      ...p,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  function removeImage() {
    if (form.imagePreview && form.imageFile) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch (err) {}
    }
    setForm((p) => ({ ...p, imageFile: null, imagePreview: "" }));
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (err) {}
    }
  }

  function addSlotToForm() {
    if (!slotDate || !slotHour) {
      showToast("error", "Select date + time");
      return;
    }
    if (slotDate < today) {
      showToast("error", "Cannot add a slot in the past");
      return;
    }
    const time = `${slotHour}:${slotMinute} ${slotAmpm}`;

    if (slotDate === today) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = timeStringToMinutes(time);
      if (slotMinutes <= nowMinutes) {
        showToast("error", "Cannot add a time that has already passed today");
        return;
      }
    }

    setForm((f) => {
      const sched = { ...f.schedule };
      if (!sched[slotDate]) sched[slotDate] = [];
      if (!sched[slotDate].includes(time)) sched[slotDate].push(time);

      sched[slotDate] = sched[slotDate].sort(
        (a, b) => timeStringToMinutes(a) - timeStringToMinutes(b),
      );
      return { ...f, schedule: sched };
    });

    setSlotHour("");
    setSlotMinute("00");
  }

  function removeSlot(date, time) {
    setForm((f) => {
      const sched = { ...f.schedule };
      sched[date] = sched[date].filter((t) => t !== time);
      if (!sched[date].length) delete sched[date];
      return { ...f, schedule: sched };
    });
  }

  function getFlatSlots(s) {
    const arr = [];
    Object.keys(s)
      .sort()
      .forEach((d) => {
        s[d].forEach((t) => arr.push({ date: d, time: t }));
      });
    return arr;
  }

  function validate(f) {
    const req = [
      "name",
      "specialization",
      "experience",
      "qualifications",
      "location",
      "about",
      "fee",
      "success",
      "patients",
      "rating",
      "email",
      "password",
    ];

    for (let k of req) if (!f[k]) return false;
    if (!f.imageFile) return false;
    if (!Object.keys(f.schedule).length) return false;
    return true;
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!validate(form)) {
      showToast("error", "Fill all fields + upload image + add slot");
      return;
    }
    const r = Number(form.rating);
    if (Number.isNaN(r) || r < 1 || r > 5) {
      showToast("error", "Rating must be a number between 1 and 5");
      return;
    }
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("specialization", form.specialization || "");
      fd.append("experience", form.experience || "");
      fd.append("qualifications", form.qualifications || "");
      fd.append("location", form.location || "");
      fd.append("about", form.about || "");
      fd.append("fee", form.fee === "" ? "0" : String(form.fee));
      fd.append("success", form.success || "");
      fd.append("patients", form.patients || "");
      fd.append("rating", form.rating === "" ? "0" : String(form.rating));
      fd.append("availability", form.availability || "Available");
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("schedule", JSON.stringify(form.schedule || {}));

      if (form.imageFile) fd.append("image", form.imageFile);

      const res = await fetch(`${API_BASE}/api/doctors`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Server error (${res.status})`;
        showToast("error", msg);
        setLoading(false);
        return;
      }

      showToast("success", "Doctor Added Successfully to PostgreSQL!");

      setForm({
        name: "",
        specialization: "",
        imageFile: null,
        imagePreview: "",
        experience: "",
        qualifications: "",
        location: "",
        about: "",
        fee: "",
        success: "",
        patients: "",
        rating: "",
        schedule: {},
        availability: "Available",
        email: "",
        password: "",
      });

      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (err) {}
      }

      setSlotDate("");
      setSlotHour("");
      setSlotMinute("00");
      setShowPassword(false);
    } catch (err) {
      console.error("submit error:", err);
      showToast("error", err?.message ? `Connection error: ${err.message}` : "Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.maxWidthContainer}>
        <div className={s.headerContainer}>
          <div className={s.headerFlexContainer}>
            <div className={s.headerIconContainer}>
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className={s.headerTitle}>Add New Specialist Doctor</h1>
          </div>
          <p className="text-emerald-700 text-sm max-w-lg mx-auto">
            Enter doctor qualifications, credentials, fees, and consultation schedules stored in PostgreSQL.
          </p>
        </div>

        <form onSubmit={handleAdd} className={s.formContainer}>
          <div className={s.formGrid}>
            <div>
              <label className={s.label}>Doctor Full Name *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. Dr. Vedant Sharma"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Specialization *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. Cardiologist, Neurologist"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Doctor Email *</label>
              <input
                type="email"
                className={s.inputBase}
                placeholder="e.g. doctor@hospital.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="relative">
              <label className={s.label}>Doctor Portal Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                className={s.inputBase + " " + s.inputWithIcon}
                placeholder="Portal login password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={s.passwordToggleButton}
              >
                {showPassword ? <EyeOff size={18} className="text-emerald-600" /> : <Eye size={18} className="text-emerald-600" />}
              </button>
            </div>

            <div>
              <label className={s.label}>Years of Experience *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. 10+ Years"
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Qualifications *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. MBBS, MD, FRCS"
                value={form.qualifications}
                onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Clinic / Hospital Location *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. Building A, 2nd Floor"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Consultation Fee (₹) *</label>
              <input
                type="number"
                className={s.inputBase}
                placeholder="e.g. 800"
                value={form.fee}
                onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Success Rate (%) *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. 98"
                value={form.success}
                onChange={(e) => setForm((p) => ({ ...p, success: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Total Treated Patients *</label>
              <input
                className={s.inputBase}
                placeholder="e.g. 5,000+"
                value={form.patients}
                onChange={(e) => setForm((p) => ({ ...p, patients: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className={s.label}>Rating (1.0 - 5.0) *</label>
              <input
                className={s.inputBase}
                placeholder="Rating (1.0 - 5.0)"
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setForm((p) => ({ ...p, rating: "" }));
                    return;
                  }
                  const n = Number(v);
                  if (Number.isNaN(n)) return;
                  const clamped = Math.max(1, Math.min(5, n));
                  const fixed = Math.round(clamped * 10) / 10;
                  setForm((p) => ({ ...p, rating: fixed.toString() }));
                }}
                onBlur={() => {
                  setForm((p) => {
                    if (!p.rating) return p;
                    const n = Number(p.rating);
                    if (Number.isNaN(n)) return { ...p, rating: "" };
                    const clamped = Math.max(1, Math.min(5, n));
                    return { ...p, rating: clamped.toFixed(1) };
                  });
                }}
                required
              />
            </div>

            <div>
              <label className={s.label}>Doctor Profile Photo *</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImage}
                  className={s.fileInput}
                />
                {form.imagePreview && (
                  <div className="relative">
                    <img src={form.imagePreview} alt="Preview" className={s.imagePreview} />
                    <button
                      type="button"
                      onClick={removeImage}
                      className={s.removeImageButton}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={s.label}>About Doctor *</label>
              <textarea
                rows={3}
                className={s.textareaBase}
                placeholder="Brief professional biography and expertise overview..."
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                required
              />
            </div>

            {/* SCHEDULE */}
            <div className={s.scheduleContainer + " md:col-span-2"}>
              <div className={s.scheduleHeader}>
                <Calendar className="text-emerald-600" />
                <p className={s.scheduleTitle}>Add Consultation Schedule Slots *</p>
              </div>

              <div className={s.scheduleInputsContainer}>
                <input
                  type="date"
                  value={slotDate}
                  min={today}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className={s.scheduleDateInput}
                />

                <select
                  value={slotHour}
                  onChange={(e) => setSlotHour(e.target.value)}
                  className={s.scheduleTimeSelect}
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  value={slotMinute}
                  onChange={(e) => setSlotMinute(e.target.value)}
                  className={s.scheduleTimeSelect}
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={String(i).padStart(2, "0")}>
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>

                <select
                  value={slotAmpm}
                  onChange={(e) => setSlotAmpm(e.target.value)}
                  className={s.scheduleTimeSelect}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>

                <button
                  type="button"
                  onClick={addSlotToForm}
                  className={s.addSlotButton + " " + s.cursorPointer}
                >
                  <Plus size={18} /> Add Slot
                </button>
              </div>

              <div className={s.slotsGrid}>
                {getFlatSlots(form.schedule).map(({ date, time }) => (
                  <div
                    key={date + time}
                    className={s.slotItem + " " + s.cursorPointer}
                  >
                    <span>
                      {formatDateISO(date)} — {time}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlot(date, time)}
                      className="text-rose-500"
                      aria-label={`Remove slot ${date} ${time}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.submitButtonContainer}>
              <button
                type="submit"
                disabled={loading}
                className={
                  s.submitButton +
                  " " +
                  (loading ? s.submitButtonDisabled : s.submitButtonEnabled)
                }
              >
                {loading ? "Saving Doctor to PostgreSQL..." : "Register Doctor"}
              </button>
            </div>
          </div>
        </form>

        {/* TOAST */}
        {toast.show && (
          <div
            className={
              s.toastContainer +
              " " +
              (toast.type === "success" ? s.toastSuccess : s.toastError)
            }
          >
            {toast.type === "success" ? (
              <CheckCircle size={22} />
            ) : (
              <XCircle size={22} />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
