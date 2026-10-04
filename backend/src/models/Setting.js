import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  mandalLogo: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  authorizedSignature: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  receiptPrefix: {
    type: DataTypes.STRING,
    defaultValue: 'GM/26',
  },
  receiptStartNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  expensePrefix: {
    type: DataTypes.STRING,
    defaultValue: 'EXP/26',
  },
  expenseStartNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  paymentModes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  donationCategories: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  expenseCategories: {
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
  tableName: 'settings',
  timestamps: true,
  hooks: {
    beforeCreate: (setting) => {
      if (!setting.paymentModes) {
        setting.paymentModes = ['CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'];
      }
      if (!setting.donationCategories) {
        setting.donationCategories = [
          'गणपती वर्गणी',
          'मुख्य देणगी',
          'महाप्रसाद',
          'सजावट',
          'सांस्कृतिक कार्यक्रम',
          'सामाजिक उपक्रम',
          'इतर',
        ];
      }
      if (!setting.expenseCategories) {
        setting.expenseCategories = [
          'Decoration',
          'Sound System',
          'Lighting',
          'Idol',
          'Pandal',
          'Prasad',
          'Cultural Events',
          'Security',
          'Electricity',
          'Cleaning',
          'Transportation',
          'Advertisement',
          'Social Work',
          'Miscellaneous',
        ];
      }
    },
  },
});

export default Setting;
