import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    trim: true,
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
}, {
  timestamps: true,
});

// Avoid duplicate donor within same mandal
donorSchema.index({ mobile: 1, mandalId: 1 }, { unique: true });

const Donor = mongoose.model('Donor', donorSchema);
export default Donor;
