import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR'),
    defaultValue: 'INFO',
  },
  readBy: {
    type: DataTypes.JSON,
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
  tableName: 'notifications',
  timestamps: true,
  hooks: {
    beforeCreate: (notif) => {
      if (!notif.readBy) {
        notif.readBy = [];
      }
    },
  },
});

export default Notification;
