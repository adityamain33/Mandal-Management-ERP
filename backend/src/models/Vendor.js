import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  businessName: {
    type: String,
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
  gstNo: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true, // e.g. Sound, Decoration, Catering
  },
  bankDetails: {
    accountNo: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branchName: { type: String, trim: true },
  },
  notes: {
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

vendorSchema.index({ mobile: 1, mandalId: 1 }, { unique: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
