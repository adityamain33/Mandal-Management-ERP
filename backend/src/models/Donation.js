import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  purpose: {
    type: String,
    required: true,
    enum: [
      'गणपती वर्गणी',
      'मुख्य देणगी',
      'महाप्रसाद',
      'सजावट',
      'सांस्कृतिक कार्यक्रम',
      'सामाजिक उपक्रम',
      'इतर',
      'Ganpati Vargani',
      'Main Donation',
      'Mahaprasad',
      'Decoration',
      'Cultural Program',
      'Social Work',
      'Other',
    ],
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['CASH', 'UPI', 'BANK TRANSFER', 'CHEQUE', 'ONLINE'],
    default: 'CASH',
  },
  status: {
    type: String,
    enum: ['PAID', 'PENDING', 'CANCELLED', 'REFUNDED'],
    default: 'PAID',
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
  notes: {
    type: String,
    trim: true,
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
