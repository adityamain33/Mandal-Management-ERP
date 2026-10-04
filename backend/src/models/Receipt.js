import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  receiptNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  donationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  collectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'CANCELLED'),
    defaultValue: 'ACTIVE',
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'receipts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['receiptNo', 'mandalId'],
    },
  ],
});

export default Receipt;
