import React from 'react';
import C1 from "../../assets/C1.png";
import C2 from "../../assets/C2.png";
import C3 from "../../assets/C3.png";
import C4 from "../../assets/C4.svg";
import C5 from "../../assets/C5.png";
import C6 from "../../assets/C6.png";
import C7 from "../../assets/C7.svg";
import { certificationStyles } from "../../assets/dummyStyles";

export default function Certification() {
  const certifications = [
    { id: 1, name: "Medical Commission", image: C1, type: "international" },
    { id: 2, name: "Government Approved", image: C2, type: "government" },
    { id: 3, name: "NABH Accredited", image: C3, alt: "NABH Accreditation", type: "healthcare" },
    { id: 4, name: "Medical Council", image: C4, type: "government" },
    { id: 5, name: "Quality Healthcare", image: C5, alt: "Quality Healthcare", type: "healthcare" },
    { id: 6, name: "Paramedical Council", image: C6, alt: "Patient Safety", type: "healthcare" },
    { id: 7, name: "Ministry of Health", image: C7, alt: "Ministry of Health", type: "government" },
  ];

  return (
    <div className={certificationStyles.container}>
      <div className={certificationStyles.contentWrapper}>
        <div className={certificationStyles.headingContainer}>
          <div className={certificationStyles.headingInner}>
            <h2 className={certificationStyles.title}>
              Accredited & <span className={certificationStyles.titleText}>Certified</span>
            </h2>
          </div>
          <p className={certificationStyles.subtitle}>
            Recognized by premier national and international healthcare accreditation boards
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 py-6">
          {certifications.map((c) => (
            <div key={c.id} className="flex flex-col items-center group">
              <div className="w-20 h-20 p-2 bg-white rounded-2xl shadow-md border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src={c.image} alt={c.name} className="max-h-16 max-w-16 object-contain" />
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-2 text-center max-w-[100px]">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}