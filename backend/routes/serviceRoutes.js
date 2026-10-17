const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Service, ServiceAppointment } = require('../models');

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

const parseJsonArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
      return typeof parsed === 'string' ? [parsed] : [];
    } catch {
      return field.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

function normalizeSlotsToMap(slotStrings = []) {
  const map = {};
  slotStrings.forEach((raw) => {
    const m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•?\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) {
      map['unspecified'] = map['unspecified'] || [];
      map['unspecified'].push(raw);
      return;
    }
    const [, day, monShort, year, hour, minute, ampm] = m;
    const monthIdx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      .findIndex(x => x.toLowerCase() === monShort.toLowerCase());
    const mm = String(monthIdx + 1).padStart(2, '0');
    const dateKey = `${year}-${mm}-${dd}`;
    const timeStr = `${String(Number(hour)).padStart(2, '0')}:${minute} ${ampm.toUpperCase()}`;
    map[dateKey] = map[dateKey] || [];
    map[dateKey].push(timeStr);
  });
  return map;
}

function formatService(s, stats = null) {
  const json = s.toJSON ? s.toJSON() : s;
  const total = stats ? stats.total : (json.totalAppointments || 0);
  const completed = stats ? stats.completed : (json.completed || 0);
  const canceled = stats ? stats.canceled : (json.canceled || 0);
  const earning = completed * (json.price || 0);

  return {
    _id: json.id,
    id: json.id,
    name: json.name || '',
    title: json.name || '',
    serviceName: json.name || '',
    about: json.about || '',
    shortDescription: json.shortDescription || '',
    price: json.price ?? 0,
    fee: json.price ?? 0,
    available: json.available !== false,
    availability: json.available ? 'available' : 'unavailable',
    imageUrl: json.imageUrl || null,
    image: json.imageUrl || null,
    imagePublicId: json.imagePublicId || null,
    dates: json.dates || (json.slots ? Object.keys(json.slots) : []),
    slots: json.slots || {},
    instructions: json.instructions || [],
    totalAppointments: total,
    completed: completed,
    canceled: canceled,
    earning: earning,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

// 1. Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ServiceAppointment,
          as: 'appointments',
          attributes: ['id', 'status', 'fees'],
        }
      ]
    });

    const normalized = services.map(s => {
      const appts = s.appointments || [];
      const total = appts.length;
      const completed = appts.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length;
      const canceled = appts.filter(a => a.status === 'Canceled').length;
      return formatService(s, { total, completed, canceled });
    });

    return res.json({ success: true, data: normalized, services: normalized });
  } catch (err) {
    console.error('getServices error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id, {
      include: [{ model: ServiceAppointment, as: 'appointments' }]
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const appts = service.appointments || [];
    const total = appts.length;
    const completed = appts.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length;
    const canceled = appts.filter(a => a.status === 'Canceled').length;

    const out = formatService(service, { total, completed, canceled });
    return res.json({ success: true, data: out, service: out });
  } catch (err) {
    console.error('getService error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Create service
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const b = req.body || {};
    const instructions = parseJsonArrayField(b.instructions);
    const rawSlots = parseJsonArrayField(b.slots);
    const slots = (b.slots && typeof b.slots === 'object' && !Array.isArray(b.slots))
      ? b.slots
      : normalizeSlotsToMap(rawSlots);
    const price = Number(String(b.price ?? 0).replace(/[^\d.-]/g, '')) || 0;
    const available = String(b.availability ?? 'available').toLowerCase() === 'available' || b.available === true;

    let imageUrl = b.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const created = await Service.create({
      name: b.name || b.serviceName || '',
      about: b.about || '',
      shortDescription: b.shortDescription || '',
      price,
      available,
      imageUrl,
      imagePublicId: null,
      dates: Object.keys(slots),
      slots,
      instructions,
    });

    const out = formatService(created);
    return res.status(201).json({ success: true, data: out, service: out });
  } catch (err) {
    console.error('createService error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating service' });
  }
});

// 4. Update service
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (b.name !== undefined) service.name = b.name;
    if (b.serviceName !== undefined) service.name = b.serviceName;
    if (b.about !== undefined) service.about = b.about;
    if (b.shortDescription !== undefined) service.shortDescription = b.shortDescription;
    if (b.price !== undefined) service.price = Number(String(b.price).replace(/[^\d.-]/g, '')) || 0;
    if (b.availability !== undefined) {
      service.available = String(b.availability).toLowerCase() === 'available' || b.availability === true;
    }
    if (b.available !== undefined) service.available = Boolean(b.available);
    if (b.instructions !== undefined) service.instructions = parseJsonArrayField(b.instructions);
    if (b.slots !== undefined) {
      const slots = (typeof b.slots === 'object' && !Array.isArray(b.slots))
        ? b.slots
        : normalizeSlotsToMap(parseJsonArrayField(b.slots));
      service.slots = slots;
      service.dates = Object.keys(slots);
    }

    if (req.file) {
      service.imageUrl = `/uploads/${req.file.filename}`;
    } else if (b.imageUrl) {
      service.imageUrl = b.imageUrl;
    }

    await service.save();

    const out = formatService(service);
    return res.json({ success: true, data: out, service: out });
  } catch (err) {
    console.error('updateService error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating service' });
  }
});

// 5. Delete service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    await ServiceAppointment.destroy({ where: { serviceId: id } });
    await service.destroy();
    return res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    console.error('deleteService error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;