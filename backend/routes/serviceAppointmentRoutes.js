const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ServiceAppointment, Service } = require('../models');

function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const t = timeStr.trim();
  const m = t.match(/([0-9]{1,2}):?([0-9]{0,2})\s*(AM|PM|am|pm)?/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  let mm = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = (m[3] || '').toUpperCase();
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  if (ampm) {
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return null;
    return { hour: hh, minute: mm, ampm };
  }

  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  if (hh === 0) return { hour: 12, minute: mm, ampm: 'AM' };
  if (hh === 12) return { hour: 12, minute: mm, ampm: 'PM' };
  if (hh > 12) return { hour: hh - 12, minute: mm, ampm: 'PM' };
  return { hour: hh, minute: mm, ampm: 'AM' };
}

function formatServiceAppointment(a) {
  const json = a.toJSON ? a.toJSON() : a;
  const service = json.service || {};
  const hour12 = json.hour || 10;
  const minStr = String(json.minute || 0).padStart(2, '0');
  const ampmStr = json.ampm || 'AM';
  const timeFormatted = `${String(hour12).padStart(2, '0')}:${minStr} ${ampmStr}`;

  return {
    _id: json.id,
    id: json.id,
    patientName: json.patientName,
    patient: json.patientName,
    mobile: json.mobile,
    age: json.age,
    gender: json.gender,
    serviceId: json.serviceId,
    serviceName: json.serviceName || service.name || 'Service',
    serviceImage: json.serviceImage || { url: service.imageUrl || '' },
    fees: json.fees,
    price: json.fees,
    amount: json.fees,
    date: json.date,
    hour: json.hour,
    minute: json.minute,
    ampm: json.ampm,
    time: timeFormatted,
    status: json.status,
    rescheduledTo: json.rescheduledTo,
    payment: json.payment,
    notes: json.notes,
    createdBy: json.createdBy,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

// 1. Stats Summary for ServiceDashboard
router.get('/stats/summary', async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: ServiceAppointment,
          as: 'appointments',
          attributes: ['id', 'status', 'fees'],
        }
      ]
    });

    const summary = services.map(s => {
      const appts = s.appointments || [];
      const total = appts.length;
      const completed = appts.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length;
      const canceled = appts.filter(a => a.status === 'Canceled').length;
      const earning = completed * (s.price || 0);

      return {
        _id: s.id,
        id: s.id,
        name: s.name,
        serviceName: s.name,
        title: s.name,
        price: s.price,
        image: s.imageUrl,
        totalAppointments: total,
        completed,
        canceled,
        earning,
      };
    });

    return res.json({ success: true, data: summary, summary });
  } catch (err) {
    console.error('getServiceAppointmentStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Get all service appointments (filters: serviceId, status, search, limit)
router.get('/', async (req, res) => {
  try {
    const { serviceId, mobile, status, search = '', limit: limitRaw = 500, page: pageRaw = 1 } = req.query;
    const limit = Math.min(500, Math.max(1, parseInt(limitRaw, 10) || 500));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const offset = (page - 1) * limit;

    const where = {};
    if (serviceId) where.serviceId = serviceId;
    if (mobile) where.mobile = mobile;
    if (status) where.status = status;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { patientName: { [Op.iLike]: term } },
        { mobile: { [Op.iLike]: term } },
        { serviceName: { [Op.iLike]: term } },
        { notes: { [Op.iLike]: term } },
      ];
    }

    const { count, rows } = await ServiceAppointment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: Service, as: 'service', attributes: ['id', 'name', 'imageUrl', 'price'] }]
    });

    const normalized = rows.map(formatServiceAppointment);

    return res.json({
      success: true,
      appointments: normalized,
      data: normalized,
      meta: { page, limit, total: count }
    });
  } catch (err) {
    console.error('getServiceAppointments error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Get user's own service appointments /me
router.get('/me', async (req, res) => {
  try {
    const { createdBy } = req.query;
    const where = {};
    if (createdBy) where.createdBy = createdBy;

    const rows = await ServiceAppointment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Service, as: 'service' }]
    });

    const normalized = rows.map(formatServiceAppointment);
    return res.json({ success: true, appointments: normalized, data: normalized });
  } catch (err) {
    console.error('getServiceAppointments/me error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 4. Create service appointment
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      serviceId,
      patientName,
      mobile,
      age,
      gender,
      date,
      time,
      hour,
      minute,
      ampm,
      fees,
      notes,
      paymentMethod = 'Cash',
      createdBy,
    } = body;

    if (!serviceId || !patientName || !mobile || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId, patientName, mobile, and date are required'
      });
    }

    const service = await Service.findByPk(serviceId);
    const serviceName = service ? service.name : (body.serviceName || '');
    const numericFee = Number(fees !== undefined ? fees : (service ? service.price : 0)) || 0;

    let parsedHour = hour !== undefined ? Number(hour) : null;
    let parsedMinute = minute !== undefined ? Number(minute) : null;
    let parsedAmpm = ampm || 'AM';

    if (time) {
      const parsed = parseTimeString(String(time));
      if (parsed) {
        parsedHour = parsed.hour;
        parsedMinute = parsed.minute;
        parsedAmpm = parsed.ampm;
      }
    }

    const appt = await ServiceAppointment.create({
      serviceId,
      serviceName,
      serviceImage: { url: service ? (service.imageUrl || '') : '', publicId: '' },
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : null,
      gender: gender || '',
      date: String(date),
      hour: parsedHour !== null ? parsedHour : 10,
      minute: parsedMinute !== null ? parsedMinute : 0,
      ampm: parsedAmpm,
      fees: numericFee,
      status: paymentMethod === 'Online' ? 'Confirmed' : 'Pending',
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'Online' ? 'Paid' : 'Pending',
        amount: numericFee
      },
      notes: notes || '',
      createdBy: createdBy || null,
    });

    const out = formatServiceAppointment(appt);
    return res.status(201).json({
      success: true,
      appointment: out,
      data: out,
      checkoutUrl: null
    });
  } catch (err) {
    console.error('createServiceAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating appointment' });
  }
});

// 5. Update service appointment (status, reschedule, notes)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const appt = await ServiceAppointment.findByPk(id, {
      include: [{ model: Service, as: 'service' }]
    });

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (body.status !== undefined) appt.status = body.status;
    if (body.notes !== undefined) appt.notes = body.notes;
    if (body.payment !== undefined) appt.payment = { ...appt.payment, ...body.payment };

    if (body.rescheduledTo) {
      const { date, time } = body.rescheduledTo || {};
      const rescheduledObj = {};
      if (date) {
        appt.date = date;
        rescheduledObj.date = date;
      }
      if (time) {
        const parsed = parseTimeString(String(time));
        if (parsed) {
          appt.hour = parsed.hour;
          appt.minute = parsed.minute;
          appt.ampm = parsed.ampm;
          rescheduledObj.time = time;
          rescheduledObj.hour = parsed.hour;
          rescheduledObj.minute = parsed.minute;
          rescheduledObj.ampm = parsed.ampm;
        }
      }
      appt.rescheduledTo = rescheduledObj;
      if (!body.status) appt.status = 'Rescheduled';
    }

    await appt.save();

    const out = formatServiceAppointment(appt);
    return res.json({ success: true, appointment: out, data: out });
  } catch (err) {
    console.error('updateServiceAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Cancel service appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await ServiceAppointment.findByPk(id, {
      include: [{ model: Service, as: 'service' }]
    });

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appt.status = 'Canceled';
    if (appt.payment) {
      appt.payment = { ...appt.payment, status: 'Canceled' };
    }
    await appt.save();

    const out = formatServiceAppointment(appt);
    return res.json({ success: true, appointment: out, data: out });
  } catch (err) {
    console.error('cancelServiceAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;