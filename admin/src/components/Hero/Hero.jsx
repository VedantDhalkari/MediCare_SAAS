import React from "react";
import { Link } from "react-router-dom";
import { heroStyles } from "../../assets/dummyStyles";
import logoImg from "../../assets/logo.png";

export default function Hero({ isDoctor = false }) {
  return (
    <div className={heroStyles.container}>
      <div className={heroStyles.mainContainer}>
        <div className={heroStyles.section}>
          <div className={heroStyles.decorativeBg.container}>
            <div className={heroStyles.decorativeBg.blurBackground}>
              <div className={heroStyles.decorativeBg.blurShape} />
            </div>

            <div className={heroStyles.contentBox}>
              <div className={heroStyles.logoContainer}>
                <img src={logoImg} alt="MediCare Logo" className={heroStyles.logo} />
              </div>

              <h1 className={heroStyles.heading}>
                {isDoctor ? "Doctor Portal" : "MediCare Hospital Administration"}
              </h1>

              <p className={heroStyles.description}>
                {isDoctor
                  ? "Access your patient records, manage appointments, and review medical reports securely from your dashboard."
                  : "Manage hospital operations, doctors, staff, patient records, and system settings from a centralized control panel."}
              </p>

              <div className={heroStyles.infoCards.container}>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>Real-time Database</h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Powered by high performance PostgreSQL with atomic transactions.
                  </p>
                </div>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>Doctor Management</h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Easily add, update schedules, and track doctor appointments.
                  </p>
                </div>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>Health Services</h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Coordinate medical test packages, checkups, and diagnostic bookings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}