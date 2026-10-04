import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  expenseNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  paymentMode: {
    type: DataTypes.ENUM('CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'),
    defaultValue: 'CASH',
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paidBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'),
    defaultValue: 'DRAFT',
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  billUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  festivalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'expenses',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['expenseNo', 'mandalId'],
    },
  ],
});

export default Expense;
