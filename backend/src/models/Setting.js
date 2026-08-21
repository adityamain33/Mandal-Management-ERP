import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
    unique: true,
  },
  mandalLogo: {
    type: String,
    default: '',
  },
  authorizedSignature: {
    type: String,
    default: '',
  },
  receiptPrefix: {
    type: String,
    default: 'GM/26',
  },
  receiptStartNumber: {
    type: Number,
    default: 1,
  },
  expensePrefix: {
    type: String,
    default: 'EXP/26',
  },
  expenseStartNumber: {
    type: Number,
    default: 1,
  },
  paymentModes: [
    {
      type: String,
      default: ['CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'],
    },
  ],
  donationCategories: [
    {
      type: String,
      default: [
        'गणपती वर्गणी',
        'मुख्य देणगी',
        'महाप्रसाद',
        'सजावट',
        'सांस्कृतिक कार्यक्रम',
        'सामाजिक उपक्रम',
        'इतर',
      ],
    },
  ],
  expenseCategories: [
    {
      type: String,
      default: [
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
      ],
    },
  ],
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
