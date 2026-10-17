require('dotenv').config();
const { Doctor, Service, Appointment, ServiceAppointment, sequelize } = require('./models');

async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to PostgreSQL for Seeding');

    // 1. Seed Comprehensive Specialist Doctors
    const doctorsData = [
      {
        name: 'Dr. Rahul Sharma',
        email: 'dr.rahul@medicare.com',
        password: 'Password123!',
        specialization: 'Cardiologist',
        experience: '12 years',
        qualifications: 'MBBS, MD (Cardiology), FACC',
        location: 'Apollo Health City, Delhi',
        about: 'Senior consultant cardiologist specializing in preventive cardiology, coronary interventions, and comprehensive cardiovascular risk assessments.',
        fee: 800,
        availability: 'Available',
        success: '98%',
        patients: '12,500+',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
        schedule: {
          '2026-10-20': ['09:00 AM', '10:30 AM', '11:45 AM', '02:30 PM'],
          '2026-10-21': ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'],
          '2026-10-22': ['09:30 AM', '11:00 AM', '02:00 PM'],
          '2026-10-23': ['10:00 AM', '01:00 PM', '03:30 PM'],
        }
      },
      {
        name: 'Dr. Priya Nair',
        email: 'dr.priya@medicare.com',
        password: 'Password123!',
        specialization: 'Neurologist',
        experience: '10 years',
        qualifications: 'MBBS, DM (Neurology), Gold Medalist',
        location: 'Fortis Neuro Sciences, Bangalore',
        about: 'Renowned neuro physician with extensive expertise in stroke management, epilepsy, migraine therapy, and neuro-rehabilitation.',
        fee: 900,
        availability: 'Available',
        success: '96%',
        patients: '8,400+',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1594824813512-888910d65b7d?auto=format&fit=crop&q=80&w=600',
        schedule: {
          '2026-10-20': ['11:00 AM', '12:30 PM', '04:00 PM'],
          '2026-10-21': ['09:00 AM', '10:30 AM', '02:00 PM'],
          '2026-10-22': ['10:30 AM', '01:30 PM', '05:00 PM'],
        }
      },
      {
        name: 'Dr. Ananya Roy',
        email: 'dr.ananya@medicare.com',
        password: 'Password123!',
        specialization: 'Dermatologist',
        experience: '8 years',
        qualifications: 'MBBS, DVD, MD (Dermatology)',
        location: 'Max Healthcare, Mumbai',
        about: 'Leading aesthetic dermatologist focusing on clinical dermatology, laser skin rejuvenation, psoriasis care, and pediatric skin conditions.',
        fee: 650,
        availability: 'Available',
        success: '99%',
        patients: '15,000+',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
        schedule: {
          '2026-10-20': ['10:00 AM', '11:15 AM', '03:30 PM', '05:00 PM'],
          '2026-10-21': ['09:30 AM', '11:00 AM', '04:00 PM'],
          '2026-10-23': ['10:00 AM', '12:00 PM', '02:30 PM'],
        }
      },
      {
        name: 'Dr. Rajesh Khanna',
        email: 'dr.rajesh@medicare.com',
        password: 'Password123!',
        specialization: 'Orthopedic Surgeon',
        experience: '15 years',
        qualifications: 'MBBS, MS (Ortho), MCh (Joint Replacement)',
        location: 'Manipal Hospital, Hyderabad',
        about: 'Pioneering orthopedic and joint replacement surgeon specializing in arthroscopic surgery, sports injuries, and robotic knee replacements.',
        fee: 750,
        availability: 'Available',
        success: '97%',
        patients: '11,200+',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
        schedule: {
          '2026-10-21': ['09:00 AM', '11:30 AM', '02:30 PM'],
          '2026-10-22': ['10:00 AM', '01:00 PM', '04:00 PM'],
          '2026-10-24': ['11:00 AM', '03:00 PM'],
        }
      },
      {
        name: 'Dr. Sneha Verma',
        email: 'dr.sneha@medicare.com',
        password: 'Password123!',
        specialization: 'Pediatrician',
        experience: '9 years',
        qualifications: 'MBBS, DCH, DNB (Pediatrics)',
        location: 'Rainbow Childrens Clinic, Pune',
        about: 'Compassionate child specialist focusing on neonatal intensive care, developmental tracking, childhood vaccinations, and nutritional guidance.',
        fee: 550,
        availability: 'Available',
        success: '99%',
        patients: '18,000+',
        rating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
        schedule: {
          '2026-10-20': ['09:30 AM', '11:00 AM', '03:30 PM'],
          '2026-10-21': ['10:30 AM', '01:00 PM', '04:30 PM'],
          '2026-10-22': ['09:00 AM', '12:00 PM'],
        }
      }
    ];

    const seededDoctors = [];
    for (const d of doctorsData) {
      let doc = await Doctor.findOne({ where: { email: d.email } });
      if (!doc) {
        doc = await Doctor.create(d);
        console.log(`+ Created Doctor: ${doc.name}`);
      } else {
        await doc.update(d);
        console.log(`✓ Updated Doctor: ${doc.name}`);
      }
      seededDoctors.push(doc);
    }

    // 2. Seed Diagnostic & Health Services
    const servicesData = [
      {
        name: 'Full Body Comprehensive Health Checkup',
        about: 'Comprehensive 72-parameter diagnostic panel including complete hemogram, lipid profile, liver function, renal panel, HbA1c, and ECG.',
        shortDescription: '72 vital parameters + Doctor consultation report',
        price: 1499,
        available: true,
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
        dates: ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'],
        slots: {
          '2026-10-20': ['07:30 AM', '08:30 AM', '09:30 AM', '10:30 AM'],
          '2026-10-21': ['07:30 AM', '08:30 AM', '10:00 AM'],
          '2026-10-22': ['08:00 AM', '09:00 AM', '11:00 AM'],
        },
        instructions: [
          '10 to 12 hours of overnight fasting is strictly mandatory.',
          'Morning medication should only be taken with plain water.',
          'Bring past medical records and prescription sheets.'
        ]
      },
      {
        name: 'Advanced Cardiac Health Package',
        about: 'Specialized non-invasive cardiac evaluation including 2D Echocardiography, TMT (Treadmill Stress Test), lipid fractionation, and troponin markers.',
        shortDescription: '2D Echo + TMT + Cardiac Enzymes + Cardiologist Review',
        price: 2499,
        available: true,
        imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
        dates: ['2026-10-20', '2026-10-22', '2026-10-24'],
        slots: {
          '2026-10-20': ['09:00 AM', '11:30 AM', '03:00 PM'],
          '2026-10-22': ['10:00 AM', '02:00 PM'],
        },
        instructions: [
          'Wear comfortable loose clothing and sports shoes for treadmill test.',
          'Avoid caffeine or tobacco 6 hours prior to the test.'
        ]
      },
      {
        name: 'Executive Diabetes & Metabolic Care',
        about: 'Rigorous diabetes profiling with fasting blood sugar, postprandial glucose, HbA1c, microalbuminuria, and diabetic foot/neuropathy screening.',
        shortDescription: 'HbA1c + Fasting/PP Sugar + Renal Panel + Diet Plan',
        price: 899,
        available: true,
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
        dates: ['2026-10-21', '2026-10-22', '2026-10-23'],
        slots: {
          '2026-10-21': ['08:00 AM', '09:00 AM', '10:30 AM'],
          '2026-10-22': ['08:00 AM', '10:00 AM'],
        },
        instructions: [
          'Fasting blood sample required first, followed by breakfast sample after exactly 2 hours.'
        ]
      }
    ];

    const seededServices = [];
    for (const s of servicesData) {
      let svc = await Service.findOne({ where: { name: s.name } });
      if (!svc) {
        svc = await Service.create(s);
        console.log(`+ Created Service: ${svc.name}`);
      } else {
        await svc.update(s);
        console.log(`✓ Updated Service: ${svc.name}`);
      }
      seededServices.push(svc);
    }

    // 3. Seed Realistic Historical & Upcoming Patient Appointments
    const appointmentsData = [
      {
        patientName: 'Aarav Patel',
        mobile: '9820123456',
        age: 38,
        gender: 'Male',
        doctorId: seededDoctors[0].id,
        doctorName: seededDoctors[0].name,
        speciality: seededDoctors[0].specialization,
        date: '2026-10-15',
        time: '10:30 AM',
        fees: seededDoctors[0].fee,
        status: 'Completed',
        payment: { method: 'Online', status: 'Paid', amount: seededDoctors[0].fee },
        notes: 'Annual cardiac health consultation. BP stable at 120/80.',
      },
      {
        patientName: 'Meera Iyer',
        mobile: '9876543210',
        age: 29,
        gender: 'Female',
        doctorId: seededDoctors[2].id,
        doctorName: seededDoctors[2].name,
        speciality: seededDoctors[2].specialization,
        date: '2026-10-16',
        time: '03:30 PM',
        fees: seededDoctors[2].fee,
        status: 'Completed',
        payment: { method: 'Cash', status: 'Paid', amount: seededDoctors[2].fee },
        notes: 'Skin allergy and mild dermatitis. Prescribed topical emollients.',
      },
      {
        patientName: 'Vikram Sengupta',
        mobile: '9988112233',
        age: 52,
        gender: 'Male',
        doctorId: seededDoctors[3].id,
        doctorName: seededDoctors[3].name,
        speciality: seededDoctors[3].specialization,
        date: '2026-10-21',
        time: '09:00 AM',
        fees: seededDoctors[3].fee,
        status: 'Confirmed',
        payment: { method: 'Online', status: 'Paid', amount: seededDoctors[3].fee },
        notes: 'Follow-up for right knee arthroscopy rehabilitation.',
      },
      {
        patientName: 'Kavita Deshmukh',
        mobile: '9123456780',
        age: 34,
        gender: 'Female',
        doctorId: seededDoctors[1].id,
        doctorName: seededDoctors[1].name,
        speciality: seededDoctors[1].specialization,
        date: '2026-10-22',
        time: '11:00 AM',
        fees: seededDoctors[1].fee,
        status: 'Pending',
        payment: { method: 'Cash', status: 'Pending', amount: seededDoctors[1].fee },
        notes: 'Recurring migraine headaches for 3 weeks.',
      },
      {
        patientName: 'Rohan Mehra',
        mobile: '9765432109',
        age: 7,
        gender: 'Male',
        doctorId: seededDoctors[4].id,
        doctorName: seededDoctors[4].name,
        speciality: seededDoctors[4].specialization,
        date: '2026-10-20',
        time: '09:30 AM',
        fees: seededDoctors[4].fee,
        status: 'Confirmed',
        payment: { method: 'Online', status: 'Paid', amount: seededDoctors[4].fee },
        notes: 'Pediatric immunization booster doses.',
      },
      {
        patientName: 'Sanjay Kapoor',
        mobile: '9845098765',
        age: 46,
        gender: 'Male',
        doctorId: seededDoctors[0].id,
        doctorName: seededDoctors[0].name,
        speciality: seededDoctors[0].specialization,
        date: '2026-10-14',
        time: '02:30 PM',
        fees: seededDoctors[0].fee,
        status: 'Canceled',
        payment: { method: 'Cash', status: 'Refunded', amount: 0 },
        notes: 'Patient requested cancellation due to travel rescheduling.',
      }
    ];

    for (const a of appointmentsData) {
      const exists = await Appointment.findOne({
        where: { patientName: a.patientName, date: a.date, time: a.time }
      });
      if (!exists) {
        await Appointment.create(a);
        console.log(`+ Created Appointment: ${a.patientName} with ${a.doctorName} (${a.status})`);
      }
    }

    // 4. Seed Diagnostic Service Appointments
    const serviceApptsData = [
      {
        patientName: 'Sunita Saxena',
        mobile: '9833445566',
        age: 48,
        gender: 'Female',
        serviceId: seededServices[0].id,
        serviceName: seededServices[0].name,
        date: '2026-10-16',
        hour: 8,
        minute: 30,
        ampm: 'AM',
        fees: seededServices[0].price,
        status: 'Completed',
        payment: { method: 'Online', status: 'Paid', amount: seededServices[0].price },
        notes: 'Annual executive master checkup. Reports issued.',
      },
      {
        patientName: 'Deepak Chopra',
        mobile: '9711223344',
        age: 55,
        gender: 'Male',
        serviceId: seededServices[1].id,
        serviceName: seededServices[1].name,
        date: '2026-10-20',
        hour: 9,
        minute: 0,
        ampm: 'AM',
        fees: seededServices[1].price,
        status: 'Confirmed',
        payment: { method: 'Online', status: 'Paid', amount: seededServices[1].price },
        notes: 'Pre-surgery 2D Echo stress profile test.',
      },
      {
        patientName: 'Harish Reddy',
        mobile: '9900112233',
        age: 42,
        gender: 'Male',
        serviceId: seededServices[2].id,
        serviceName: seededServices[2].name,
        date: '2026-10-21',
        hour: 8,
        minute: 0,
        ampm: 'AM',
        fees: seededServices[2].price,
        status: 'Pending',
        payment: { method: 'Cash', status: 'Pending', amount: seededServices[2].price },
        notes: 'Quarterly fasting and HbA1c glucose monitor.',
      }
    ];

    for (const sa of serviceApptsData) {
      const exists = await ServiceAppointment.findOne({
        where: { patientName: sa.patientName, date: sa.date }
      });
      if (!exists) {
        await ServiceAppointment.create(sa);
        console.log(`+ Created Service Appointment: ${sa.patientName} for ${sa.serviceName} (${sa.status})`);
      }
    }

    console.log('====================================================');
    console.log('✓ ALL MOCK & EXAMPLE DATA SEEDED TO POSTGRESQL');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding error:', err);
    process.exit(1);
  }
}

seedData();
