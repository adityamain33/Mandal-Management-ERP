import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Donor = sequelize.define('Donor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mandalId: {
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
  tableName: 'donors',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['mobile', 'mandalId'],
    },
  ],
});

export default Donor;
