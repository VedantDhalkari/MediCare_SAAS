import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { CircleChevronUp } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

// Import Pages & Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Certification from "./components/Certification/Certification";
import HomeDoctors from "./components/HomeDoctors/HomeDoctors";
import ServicePage from "./components/ServicePage/ServicePage";
import Testimonial from "./components/Testimonial/Testimonial";
import ContactPage from "./components/ContactPage/ContactPage";
import DoctorsPage from "./components/DoctorsPage/DoctorsPage";
import AppointmentPage from "./components/AppointmentPage/AppointmentPage";
import LoginPage from "./components/LoginPage/LoginPage";
import DoctorDetail from "./pages/DoctorDetail/DoctorDetail";
import ServiceDetail from "./pages/ServiceDetailPage/ServiceDetailPage";

// Doctor Panel Components
import DoctorNavbar from "./doctor/Navbar/Navbar";
import DoctorDashboard from "./doctor/DashboardPage/DashboardPage";
import DoctorListPage from "./doctor/ListPage/ListPage";
import DoctorEditProfile from "./doctor/EditProfilePage/EditProfilePage";

import { bannerStyles } from "./assets/dummyStyles";
import BannerImg from "./assets/BannerImg.png";

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollTop}
      className={`fixed right-4 bottom-6 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-lg transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} hover:scale-110 hover:shadow-xl`}
      title="Go to top"
    >
      <CircleChevronUp size={22} />
    </button>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Banner / Hero Section */}
      <div className={bannerStyles.bannerContainer}>
        <div className={bannerStyles.mainContainer}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 opacity-90" />
          <div className="relative z-10 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold uppercase tracking-wider">
                🌟 Advanced Healthcare Portal
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Your Health, Our Top Priority
              </h1>
              <p className="text-emerald-50 text-base sm:text-lg max-w-xl">
                Book consultations with experienced medical professionals, diagnostic services, and manage your health seamlessly.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-full shadow-lg hover:bg-emerald-50 transition-all transform hover:-translate-y-0.5"
                >
                  Find Doctors
                </Link>
                <Link
                  to="/services"
                  className="px-6 py-3 bg-emerald-700/80 hover:bg-emerald-800 text-white font-bold rounded-full border border-emerald-300/40 backdrop-blur-md shadow-lg transition-all"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src={BannerImg}
                alt="Healthcare Banner"
                className="max-h-80 object-contain drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <Certification />
      <HomeDoctors />
      <ServicePage />
      <Testimonial />
    </div>
  );
};

const DoctorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorNavbar />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

function LayoutWrapper() {
  const location = useLocation();
  const isDoctorRoute = location.pathname.startsWith("/doctor-admin");
  const isLoginPage = location.pathname === "/doctor-admin/login";

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!isDoctorRoute && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Doctor Portal Routes */}
          <Route path="/doctor-admin/login" element={<LoginPage />} />
          <Route
            path="/doctor-admin/:id"
            element={
              <DoctorLayout>
                <DoctorDashboard />
              </DoctorLayout>
            }
          />
          <Route
            path="/doctor-admin/:id/appointments"
            element={
              <DoctorLayout>
                <DoctorListPage />
              </DoctorLayout>
            }
          />
          <Route
            path="/doctor-admin/:id/profile/edit"
            element={
              <DoctorLayout>
                <DoctorEditProfile />
              </DoctorLayout>
            }
          />
        </Routes>
      </div>
      {!isDoctorRoute && <Footer />}
      <ScrollButton />
      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
}