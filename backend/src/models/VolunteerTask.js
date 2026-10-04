import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const VolunteerTask = sequelize.define('VolunteerTask', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
    defaultValue: 'PENDING',
  },
  dueDate: {
    type: DataTypes.DATE,
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
  tableName: 'volunteer_tasks',
  timestamps: true,
});

export default VolunteerTask;
