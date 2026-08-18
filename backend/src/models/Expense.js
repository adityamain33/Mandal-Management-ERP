import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  expenseNo: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
    enum: [
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
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'],
    default: 'CASH',
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  paidBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'],
    default: 'DRAFT',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
    trim: true,
  },
  billUrl: {
    type: String,
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Festival',
    required: true,
  },
}, {
  timestamps: true,
});

expenseSchema.index({ expenseNo: 1, mandalId: 1 }, { unique: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
