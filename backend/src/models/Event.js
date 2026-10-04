import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  coordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  volunteers: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'SCHEDULED',
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
  tableName: 'events',
  timestamps: true,
  hooks: {
    beforeCreate: (event) => {
      if (!event.volunteers) {
        event.volunteers = [];
      }
    },
  },
});

export default Event;
