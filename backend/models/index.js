const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  specialization: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  imageUrl: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  imagePublicId: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  experience: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  qualifications: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  about: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  fee: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  availability: {
    type: DataTypes.STRING,
    defaultValue: 'Available',
  },
  schedule: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  success: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  patients: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  tableName: 'doctors',
  timestamps: true,
});

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  about: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  shortDescription: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  imagePublicId: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  dates: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  slots: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  instructions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  totalAppointments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  canceled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'services',
  timestamps: true,
});

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  doctorName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  speciality: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  doctorImage: {
    type: DataTypes.JSONB,
    defaultValue: { url: '', publicId: '' },
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fees: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  rescheduledTo: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },
  payment: {
    type: DataTypes.JSONB,
    defaultValue: { method: 'Cash', status: 'Pending', amount: 0 },
  },
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  paidAt: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  createdBy: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  owner: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
});

const ServiceAppointment = sequelize.define('ServiceAppointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  serviceName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  serviceImage: {
    type: DataTypes.JSONB,
    defaultValue: { url: '', publicId: '' },
  },
  fees: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10,
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  ampm: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'AM',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  rescheduledTo: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },
  payment: {
    type: DataTypes.JSONB,
    defaultValue: { method: 'Cash', status: 'Pending', amount: 0 },
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  createdBy: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
}, {
  tableName: 'service_appointments',
  timestamps: true,
});

// Associations
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Service.hasMany(ServiceAppointment, { foreignKey: 'serviceId', as: 'appointments' });
ServiceAppointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

module.exports = {
  sequelize,
  Doctor,
  Service,
  Appointment,
  ServiceAppointment,
};