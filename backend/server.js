require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/service-appointments', require('./routes/serviceAppointmentRoutes'));

app.get('/', (req, res) => res.json({ status: 'ok', message: 'MediCare PostgreSQL API running' }));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(async () => {
  console.log('✓ PostgreSQL connected & tables synced');
  try {
    const docCount = await sequelize.models.Doctor.count();
    if (docCount < 2) {
      console.log('ℹ Bootstrapping mock data for demonstration...');
      require('./seed');
    }
  } catch (seedErr) {
    console.error('Seed check warning:', seedErr.message);
  }
  app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
}).catch(err => console.error('✗ DB error:', err));