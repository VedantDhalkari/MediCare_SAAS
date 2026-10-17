const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Doctor, Appointment, sequelize } = require('../models');

// Configure upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

function parseScheduleInput(s) {
  if (!s) return {};
  if (typeof s === 'string') {
    try {
      s = JSON.parse(s);
    } catch {
      return {};
    }
  }
  return s || {};
}

function formatDoctor(d, appointmentStats = null) {
  const json = d.toJSON ? d.toJSON() : d;
  const stats = appointmentStats || { total: 0, completed: 0, canceled: 0, earnings: 0 };
  return {
    _id: json.id,
    id: json.id,
    name: json.name || '',
    email: json.email || '',
    specialization: json.specialization || '',
    fee: json.fee ?? 0,
    imageUrl: json.imageUrl || null,
    imagePublicId: json.imagePublicId || null,
    experience: json.experience || '',
    qualifications: json.qualifications || '',
    location: json.location || '',
    about: json.about || '',
    availability: json.availability || 'Available',
    schedule: json.schedule || {},
    success: json.success || '',
    patients: json.patients || '',
    rating: json.rating || 0,
    appointmentsTotal: stats.total,
    appointmentsCompleted: stats.completed,
    appointmentsCanceled: stats.canceled,
    earnings: stats.earnings,
    appointments: {
      total: stats.total,
      completed: stats.completed,
      canceled: stats.canceled,
    },
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

// 1. Doctor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const doctor = await Doctor.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, doctor.password || '');
    if (!match && password !== doctor.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      doctor: { _id: doctor.id, id: doctor.id, name: doctor.name, email: doctor.email },
      data: { token, _id: doctor.id, id: doctor.id, name: doctor.name }
    });
  } catch (err) {
    console.error('Doctor login error:', err);
    return res.status(500).json({ success: false, message: 'Login error' });
  }
});

// 2. Get all doctors (with search & pagination)
router.get('/', async (req, res) => {
  try {
    const { q = '', limit: limitRaw = 200, page: pageRaw = 1 } = req.query;
    const limit = Math.min(500, Math.max(1, parseInt(limitRaw, 10) || 200));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const offset = (page - 1) * limit;

    const where = {};
    if (q && typeof q === 'string' && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: term } },
        { specialization: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { location: { [Op.iLike]: term } },
      ];
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Appointment,
          as: 'appointments',
          attributes: ['id', 'status', 'fees', 'payment'],
        }
      ]
    });

    const normalized = doctors.map(d => {
      const appts = d.appointments || [];
      const total = appts.length;
      const completed = appts.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length;
      const canceled = appts.filter(a => a.status === 'Canceled').length;
      const earnings = appts
        .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
        .reduce((sum, a) => sum + (Number(a.fees) || 0), 0);

      return formatDoctor(d, { total, completed, canceled, earnings });
    });

    return res.json({
      success: true,
      data: normalized,
      doctors: normalized,
      meta: { page, limit, total: count }
    });
  } catch (err) {
    console.error('getDoctors error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Get single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: Appointment, as: 'appointments' }]
    });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const appts = doctor.appointments || [];
    const total = appts.length;
    const completed = appts.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length;
    const canceled = appts.filter(a => a.status === 'Canceled').length;
    const earnings = appts
      .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
      .reduce((sum, a) => sum + (Number(a.fees) || 0), 0);

    const out = formatDoctor(doctor, { total, completed, canceled, earnings });
    return res.json({ success: true, data: out, doctor: out });
  } catch (err) {
    console.error('getDoctor error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 4. Create doctor (Admin)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    const emailLC = (body.email || '').toLowerCase().trim();
    if (!emailLC) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existing = await Doctor.findOne({ where: { email: emailLC } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Doctor with this email already exists' });
    }

    let hashedPassword = '';
    if (body.password) {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    let imageUrl = body.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const schedule = parseScheduleInput(body.schedule);

    const doc = await Doctor.create({
      email: emailLC,
      password: hashedPassword || body.password || '',
      name: body.name || '',
      specialization: body.specialization || '',
      imageUrl,
      imagePublicId: null,
      availability: body.availability || 'Available',
      experience: body.experience || '',
      qualifications: body.qualifications || '',
      location: body.location || '',
      about: body.about || '',
      fee: body.fee !== undefined ? Number(body.fee) : 0,
      schedule,
      success: body.success || '',
      patients: body.patients || '',
      rating: body.rating !== undefined ? Number(body.rating) : 0,
    });

    const out = formatDoctor(doc);
    return res.status(201).json({ success: true, data: out, doctor: out });
  } catch (err) {
    console.error('createDoctor error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating doctor' });
  }
});

// 5. Update doctor (Doctor or Admin)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    let imageUrl = doctor.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (body.imageUrl) {
      imageUrl = body.imageUrl;
    }

    if (body.schedule) doctor.schedule = parseScheduleInput(body.schedule);

    const updatable = [
      'name', 'specialization', 'experience', 'qualifications',
      'location', 'about', 'fee', 'availability', 'success', 'patients', 'rating'
    ];
    updatable.forEach(k => {
      if (body[k] !== undefined) doctor[k] = body[k];
    });

    doctor.imageUrl = imageUrl;

    if (body.email && body.email.toLowerCase().trim() !== doctor.email) {
      const newEmail = body.email.toLowerCase().trim();
      const other = await Doctor.findOne({ where: { email: newEmail } });
      if (other && other.id !== id) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      doctor.email = newEmail;
    }

    if (body.password) {
      doctor.password = await bcrypt.hash(body.password, 10);
    }

    await doctor.save();

    const out = formatDoctor(doctor);
    return res.json({ success: true, data: out, doctor: out });
  } catch (err) {
    console.error('updateDoctor error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Delete doctor (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    await Appointment.destroy({ where: { doctorId: id } });
    await doctor.destroy();
    return res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('deleteDoctor error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;