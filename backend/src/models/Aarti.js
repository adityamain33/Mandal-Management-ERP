import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Aarti = sequelize.define('Aarti', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploadedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '1.0 MB',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'all',
  },
  categoryLabel: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'मंडळ PDF',
  },
  deity: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'श्री गणेश',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pagesCount: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'PDF',
  },
}, {
  timestamps: true,
  tableName: 'aartis',
  getterMethods: {
    _id() {
      return this.id;
    },
  },
});

export default Aarti;
