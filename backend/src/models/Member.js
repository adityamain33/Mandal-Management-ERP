import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
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
  dob: {
    type: Date,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    required: true,
    enum: [
      'President',
      'Vice President',
      'Secretary',
      'Treasurer',
      'Committee Member',
      'Volunteer',
      'Member',
    ],
    default: 'Member',
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  emergencyContact: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
}, {
  timestamps: true,
});

memberSchema.index({ mobile: 1, mandalId: 1 }, { unique: true });

const Member = mongoose.model('Member', memberSchema);
export default Member;
