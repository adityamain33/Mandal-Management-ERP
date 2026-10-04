import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'),
    allowNull: false,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'accounts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code', 'mandalId'],
    },
  ],
});

export default Account;
