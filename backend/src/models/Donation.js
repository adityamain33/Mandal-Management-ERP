import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  donorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.ENUM('CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'),
    defaultValue: 'CASH',
  },
  status: {
    type: DataTypes.ENUM('PAID', 'PENDING', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PAID',
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  festivalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  collectorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'donations',
  timestamps: true,
});

export default Donation;
