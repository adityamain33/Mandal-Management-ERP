import mongoose from 'mongoose';

const mandalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  registrationDetails: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  configuration: {
    receiptPrefix: {
      type: String,
      default: 'MS',
    },
    receiptStartNumber: {
      type: Number,
      default: 1,
    },
    defaultCurrency: {
      type: String,
      default: 'INR',
    },
  },
}, {
  timestamps: true,
});

const Mandal = mongoose.model('Mandal', mandalSchema);
export default Mandal;
