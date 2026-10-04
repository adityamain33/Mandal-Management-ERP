import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Festival = sequelize.define('Festival', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  budget: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  expectedDonation: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('UPCOMING', 'ACTIVE', 'COMPLETED'),
    defaultValue: 'UPCOMING',
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'festivals',
  timestamps: true,
});

export default Festival;
