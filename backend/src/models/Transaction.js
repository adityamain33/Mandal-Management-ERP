import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  entries: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  donationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  expenseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receiptId: {
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
  tableName: 'transactions',
  timestamps: true,
  hooks: {
    beforeCreate: (tx) => {
      if (!tx.entries) {
        tx.entries = [];
      }
    },
  },
});

export default Transaction;
