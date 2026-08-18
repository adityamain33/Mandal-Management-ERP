import mongoose from 'mongoose';

const festivalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
  theme: {
    type: String,
    trim: true,
  },
  budget: {
    type: Number,
    default: 0,
  },
  expectedDonation: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
    default: 'UPCOMING',
  },
}, {
  timestamps: true,
});

const Festival = mongoose.model('Festival', festivalSchema);
export default Festival;
