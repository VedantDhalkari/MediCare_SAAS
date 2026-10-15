import React, { useState } from "react";
import { Phone, MapPin, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { contactPageStyles } from "../../assets/dummyStyles";

export default function ContactPage() {
  const initial = {
    name: "",
    email: "",
    phone: "",
    department: "",
    service: "",
    message: "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const departments = [
    "General Physician",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Gynecology",
  ];

  const servicesMapping = {
    "General Physician": [
      "General Consultation",
      "Adult Checkup",
      "Vaccination",
      "Health Screening",
    ],
    Cardiology: [
      "ECG",
      "Echocardiography",
      "Stress Test",
      "Heart Consultation",
    ],
    Orthopedics: ["Fracture Care", "Joint Pain Consultation", "Physiotherapy"],
    Dermatology: ["Skin Consultation", "Allergy Test", "Acne Treatment"],
    Pediatrics: ["Child Checkup", "Vaccination (Child)", "Growth Monitoring"],
    Gynecology: ["Antenatal Care", "Pap Smear", "Ultrasound"],
  };

  const genericServices = [
    "General Consultation",
    "ECG",
    "Blood Test",
    "X-Ray",
    "Ultrasound",
    "Physiotherapy",
    "Vaccination",
  ];

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      e.phone = "Phone number must be exactly 10 digits";

    if (!form.department && !form.service) {
      e.department = "Please choose a department or service";
      e.service = "Please choose a department or service";
    }

    if (!form.message.trim()) e.message = "Please write a short message";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "department") {
      setForm((prev) => ({ ...prev, department: value, service: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const text = `*Contact Request*\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nDepartment: ${form.department || "N/A"}\nService: ${form.service || "N/A"}\nMessage: ${form.message}`;
    const url = `https://wa.me/918299431275?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    setForm(initial);
    setErrors({});
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const availableServices = form.department
    ? servicesMapping[form.department] || []
    : genericServices;

  return (
    <div className={contactPageStyles.pageContainer}>
      <div className={contactPageStyles.maxWidthContainer}>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-800">Contact MediCare</h1>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Have questions about an appointment or need assistance? Reach out to our 24/7 care team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
              <MessageSquare className="text-emerald-600" /> Send a Message
            </h2>

            {sent && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
                <CheckCircle2 size={24} />
                <span>Thank you! Your inquiry was received. We will connect with you promptly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={contactPageStyles.label}>Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={contactPageStyles.input}
                />
                {errors.name && <p className={contactPageStyles.error}>{errors.name}</p>}
              </div>

              <div className={contactPageStyles.formGrid}>
                <div>
                  <label className={contactPageStyles.label}>
                    <Mail size={16} /> Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={contactPageStyles.input}
                  />
                  {errors.email && <p className={contactPageStyles.error}>{errors.email}</p>}
                </div>

                <div>
                  <label className={contactPageStyles.label}>
                    <Phone size={16} /> Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10 digits number"
                    className={contactPageStyles.input}
                    maxLength="10"
                  />
                  {errors.phone && <p className={contactPageStyles.error}>{errors.phone}</p>}
                </div>
              </div>

              <div className={contactPageStyles.formGrid}>
                <div>
                  <label className={contactPageStyles.label}>
                    <MapPin size={16} /> Department
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={contactPageStyles.input}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={contactPageStyles.label}>Service</label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className={contactPageStyles.input}
                  >
                    <option value="">Select Service</option>
                    {availableServices.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={contactPageStyles.label}>Message</label>
                <textarea
                  name="message"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your query or symptoms here..."
                  className={contactPageStyles.textarea}
                />
                {errors.message && <p className={contactPageStyles.error}>{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} /> Send Inquiry via WhatsApp
              </button>
            </form>
          </div>

          {/* Map & Location */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Hospital Location</h3>
              <p className="text-slate-600 text-sm mb-4">
                MediCare Multi-Speciality Health Center, Gomti Nagar, Lucknow, Uttar Pradesh.
              </p>
              <div className="w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-emerald-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.460792853461!2d80.98709187529213!3d26.870382662861033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2ae3cea2421%3A0x6c0de12e8a77818f!2sGomti%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1731769000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  title="Gomti Nagar Map"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}