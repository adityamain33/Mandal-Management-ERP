import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true,
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
  gstNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankDetails: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  notes: {
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
  tableName: 'vendors',
  timestamps: true,
  hooks: {
    beforeCreate: (vendor) => {
      if (!vendor.bankDetails) {
        vendor.bankDetails = {
          accountNo: '',
          ifscCode: '',
          bankName: '',
          branchName: '',
        };
      }
    },
  },
  indexes: [
    {
      unique: true,
      fields: ['mobile', 'mandalId'],
    },
  ],
});

export default Vendor;
