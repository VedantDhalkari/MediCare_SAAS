# 🏥 Project Poster Content & Submission Details

**Institution:** Vishwakarma University, Pune  
**Department:** Department of Computer Engineering / Science & Technology  
**Project Group ID:** `G55`  
**Project Guide:** `Prof. Suhas Chavan`  
**Project Title:** `Cloud-Based Hospital Appointment System (MediCare SAAS)`  

---

## 👥 Student & Team Details

| Sr. No. | Roll No. | PRN | Student ID | Student Name | Institutional Email | Contact Number |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| 45 | 14 | 3124045020031 | 31240218 | **Zaid Nayeem Shaikh** | 31240218@vupune.ac.in | 7385451035 |
| 46 | 15 | 3124045020033 | 31240223 | **Om Sunil Vedpathak** | 31240223@vupune.ac.in | 9146392877 |
| 47 | 32 | 3124045010528 | 31241317 | **Harshad Jadhav** | 31241317@vupune.ac.in | 9307814641 |
| 48 | 54 | 3124045020222 | 31242589 | **Vedant Dhalkari** | 31242589@vupune.ac.in | 7972571540 |
| 49 | 46 | 3124045020203 | 31242484 | **Kedar Ajay Ghadage** | 31242484@vupune.ac.in | 8080926440 |

---

## ❗ Problem Statement
Traditional hospital appointment and diagnostic scheduling systems suffer from:
1. **Prolonged Patient Wait Times:** Severe physical congestion and queuing due to lack of pre-scheduled appointment allocations.
2. **Double-Booking & Slot Collisions:** Inability of manual registers to prevent concurrent bookings across physical desks and remote channels.
3. **Diagnostic Test Preparation Inefficiencies:** Patients attending specialized diagnostic packages (e.g., fasting blood profiles) unprepared, leading to cancelled appointments and delayed patient care.
4. **Data Inconsistency & Fragility:** Lack of transactional integrity, schema validation, and cloud-native resilience in legacy on-premise systems.

---

## 🎯 Project Objectives
1. **Develop an Interactive Patient Portal:** Allow users to browse verified doctor profiles, qualifications, consultation fees, and real-time slot availability.
2. **Automate Diagnostic Packages Booking:** Enable instant scheduling of multi-parameter health checkups with automated fasting and clinical preparation instructions.
3. **Build an Executive Hospital Admin Dashboard:** Provide clinical administrators with live patient appointment queues, doctor schedule management, and revenue analytics.
4. **Enforce Relational ACID Compliance:** Utilize **PostgreSQL 15** and **Sequelize ORM** with foreign keys, cascading integrity, and transactional reliability.
5. **Architect a Production Cloud System on AWS:** Containerize the entire application using **Docker & Docker Compose** behind an **Nginx Reverse Proxy** on an **AWS EC2 Free Tier instance** with automated 2GB swap space.

---

## 💡 Proposed Solution
**MediCare SAAS** is an enterprise-grade, decoupled healthcare management platform featuring:
- **Patient & Doctor Portal (Port 80):** Responsive Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS offering seamless appointment scheduling.
- **Admin Dashboard (Port 8080):** High-level hospital management interface for doctor slot creation, diagnostic offerings, and real-time appointment status updates (`Pending`, `Confirmed`, `Completed`, `Canceled`).
- **RESTful API Backend (Port 5000):** High-throughput Express.js engine providing validated endpoints for medical records and appointments.
- **Relational PostgreSQL Database:** Robust data layer with automated table syncing, seed data bootstrapping, and persistent Docker volume storage.
- **Reverse Proxy Gateway:** Nginx edge router orchestrating incoming requests without CORS conflicts and caching static assets.

---

## 🏛️ System Architecture

```text
[ Patient Web Browser ]                [ Hospital Administrator ]
         │                                       │
         ▼ (Port 80)                             ▼ (Port 8080)
┌──────────────────────────────────────────────────────────────┐
│             Nginx Unified Reverse Proxy Gateway              │
│       • Ingress routing for Port 80 & Port 8080              │
│       • Edge asset caching & CORS-free API reverse proxy     │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
        ┌──────┴──────┐                 ┌──────┴──────┐
        ▼             ▼                 ▼             ▼
   [Frontend SPA] [/api/*]         [Admin SPA]   [/api/*]
   (React 19)                      (React 19)
                      │                               │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Node.js Express REST API   │
                      │     (Docker Alpine Port 5000) │
                      └───────────────┬───────────────┘
                                      │ (Sequelize ORM)
                                      ▼
                      ┌───────────────────────────────┐
                      │    PostgreSQL 15 Database     │
                      │   (Docker Container Port 5432)│
                      └───────────────────────────────┘
```

---

## 🛠️ Technologies Used

- **Cloud Platform:** Amazon Web Services (AWS EC2 - Ubuntu 22.04 LTS)
- **Containerization & Orchestration:** Docker, Docker Compose
- **Web Server & Gateway:** Nginx Reverse Proxy
- **Database:** PostgreSQL 15, Sequelize ORM
- **Backend API:** Node.js 20, Express.js REST Framework
- **Frontend & Admin UI:** React 19, Vite 7, Tailwind CSS, Lucide React
- **Infrastructure as Code (IaC):** Terraform

---

## 📊 Key Highlights & Results
- **Zero-Cost Deployment:** 100% Free Tier eligible on AWS EC2 (`t2.micro` with 30GB gp3 storage).
- **Fast Response Time:** Sub-300ms API latency with optimized Alpine containers.
- **Swap-Optimized Memory:** Automated 2GB swap partition ensuring compilation without out-of-memory errors on 1GB RAM instances.
- **1-Command Deploy & Update:** Automated `deploy.sh` for first-time installation and `update.sh` for fast git synchronization in seconds.

---

## 🖨️ How to View & Print the Poster

1. Open the file [poster/index.html](file:///v:/MediCare_SAAS/poster/index.html) in your web browser (Google Chrome, Microsoft Edge, or Firefox).
2. Click the **"🖨️ Print / Save as High-Res PDF"** button at the top (or press `Ctrl + P`).
3. In the Print dialog:
   - **Destination:** Save as PDF
   - **Layout:** Landscape
   - **Paper Size:** A3 (or A4 / Tabloid)
   - **Options:** Check **Background graphics** for rich colors.
4. Click **Save** to generate a presentation-ready PDF for your submission!
