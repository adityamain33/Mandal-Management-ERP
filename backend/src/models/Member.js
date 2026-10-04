import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Member = sequelize.define('Member', {
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
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.ENUM(
      'President',
      'Vice President',
      'Secretary',
      'Treasurer',
      'Committee Member',
      'Volunteer',
      'Member'
    ),
    defaultValue: 'Member',
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'),
    defaultValue: 'Unknown',
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
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
  tableName: 'members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['mobile', 'mandalId'],
    },
  ],
});

export default Member;
