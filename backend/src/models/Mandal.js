import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Mandal = sequelize.define('Mandal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registrationDetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  configuration: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    },
  },
}, {
  tableName: 'mandals',
  timestamps: true,
  hooks: {
    beforeCreate: (mandal) => {
      if (!mandal.configuration) {
        mandal.configuration = {
          receiptPrefix: 'MS',
          receiptStartNumber: 1,
          defaultCurrency: 'INR',
        };
      }
    },
  },
});

export default Mandal;
