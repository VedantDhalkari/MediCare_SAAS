const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Appointment, Doctor } = require('../models');

function formatAppointment(a) {
  const json = a.toJSON ? a.toJSON() : a;
  const doctor = json.doctor || {};
  return {
    _id: json.id,
    id: json.id,
    patientName: json.patientName,
    mobile: json.mobile,
    age: json.age,
    gender: json.gender,
    doctorId: json.doctorId,
    doctorName: json.doctorName || doctor.name || '',
    speciality: json.speciality || doctor.specialization || '',
    doctorImage: json.doctorImage || { url: doctor.imageUrl || '' },
    date: json.date,
    time: json.time,
    fees: json.fees,
    fee: json.fees,
    status: json.status,
    rescheduledTo: json.rescheduledTo,
    payment: json.payment,
    notes: json.notes,
    createdBy: json.createdBy,
    owner: json.owner,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    slot: {
      date: json.date,
      time: json.time,
    }
  };
}

// 1. Get appointments (with filter by doctorId, mobile, status, search)
router.get('/', async (req, res) => {
  try {
    const { doctorId, mobile, status, search = '', limit: limitRaw = 200, page: pageRaw = 1 } = req.query;
    const limit = Math.min(500, Math.max(1, parseInt(limitRaw, 10) || 200));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const offset = (page - 1) * limit;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (mobile) where.mobile = mobile;
    if (status) where.status = status;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { patientName: { [Op.iLike]: term } },
        { mobile: { [Op.iLike]: term } },
        { doctorName: { [Op.iLike]: term } },
        { speciality: { [Op.iLike]: term } },
        { notes: { [Op.iLike]: term } },
      ];
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialization', 'imageUrl'] }]
    });

    const normalized = rows.map(formatAppointment);

    return res.json({
      success: true,
      appointments: normalized,
      data: normalized,
      meta: { page, limit, total: count }
    });
  } catch (err) {
    console.error('getAppointments error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Get appointments for currently logged-in user /me
router.get('/me', async (req, res) => {
  try {
    const { createdBy } = req.query;
    const where = {};
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const rows = await Appointment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Doctor, as: 'doctor' }]
    });

    const normalized = rows.map(formatAppointment);
    return res.json({ success: true, appointments: normalized, data: normalized });
  } catch (err) {
    console.error('getAppointments/me error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Get appointments by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { mobile, status, search = '' } = req.query;

    const where = { doctorId };
    if (mobile) where.mobile = mobile;
    if (status) where.status = status;
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { patientName: { [Op.iLike]: term } },
        { mobile: { [Op.iLike]: term } },
        { notes: { [Op.iLike]: term } },
      ];
    }

    const rows = await Appointment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Doctor, as: 'doctor' }]
    });

    const normalized = rows.map(formatAppointment);
    return res.json({ success: true, appointments: normalized, data: normalized });
  } catch (err) {
    console.error('getAppointmentsByDoctor error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 4. Create appointment
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      doctorId,
      patientName,
      mobile,
      age,
      gender,
      date,
      time,
      fees,
      notes,
      paymentMethod = 'Cash',
      createdBy,
    } = body;

    if (!doctorId || !patientName || !mobile || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, patientName, mobile, date, and time are required'
      });
    }

    const doctor = await Doctor.findByPk(doctorId);
    const doctorName = doctor ? doctor.name : (body.doctorName || '');
    const speciality = doctor ? doctor.specialization : (body.speciality || '');
    const numericFee = Number(fees !== undefined ? fees : (doctor ? doctor.fee : 0)) || 0;

    const appt = await Appointment.create({
      doctorId,
      doctorName,
      speciality,
      doctorImage: { url: doctor ? (doctor.imageUrl || '') : '', publicId: '' },
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : null,
      gender: gender || '',
      date: String(date),
      time: String(time),
      fees: numericFee,
      status: paymentMethod === 'Online' ? 'Confirmed' : 'Pending',
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'Online' ? 'Paid' : 'Pending',
        amount: numericFee
      },
      notes: notes || '',
      createdBy: createdBy || null,
      owner: null,
    });

    const out = formatAppointment(appt);
    return res.status(201).json({
      success: true,
      appointment: out,
      data: out,
      checkoutUrl: null
    });
  } catch (err) {
    console.error('createAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error booking appointment' });
  }
});

// 5. Update appointment (status, rescheduling, notes)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const appt = await Appointment.findByPk(id, {
      include: [{ model: Doctor, as: 'doctor' }]
    });

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (body.status) appt.status = body.status;
    if (body.notes !== undefined) appt.notes = body.notes;

    if (body.date && body.time) {
      appt.date = body.date;
      appt.time = body.time;
      appt.status = 'Rescheduled';
      appt.rescheduledTo = { date: body.date, time: body.time };
    }

    if (body.payment) {
      appt.payment = { ...appt.payment, ...body.payment };
    }

    await appt.save();

    const out = formatAppointment(appt);
    return res.json({ success: true, appointment: out, data: out });
  } catch (err) {
    console.error('updateAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Admin cancel appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findByPk(id, {
      include: [{ model: Doctor, as: 'doctor' }]
    });

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appt.status = 'Canceled';
    if (appt.payment) {
      appt.payment = { ...appt.payment, status: 'Canceled' };
    }
    await appt.save();

    const out = formatAppointment(appt);
    return res.json({ success: true, appointment: out, data: out });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;