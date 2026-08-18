import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMode: {
    type: String,
    required: true,
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED'],
    default: 'ACTIVE',
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
  pdfPath: {
    type: String,
  },
}, {
  timestamps: true,
});

// Enforce unique receipt numbers per mandal
receiptSchema.index({ receiptNo: 1, mandalId: 1 }, { unique: true });

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
