import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.ENUM(
      'Decoration',
      'Security',
      'Prasad',
      'Traffic',
      'Cultural',
      'Social Work',
      'Finance',
      'Digital',
      'Cleaning',
      'Management'
    ),
    defaultValue: 'Management',
  },
  hoursWorked: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
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
  tableName: 'volunteers',
  timestamps: true,
  hooks: {
    beforeCreate: (vol) => {
      if (!vol.skills) {
        vol.skills = [];
      }
    },
  },
});

export default Volunteer;
