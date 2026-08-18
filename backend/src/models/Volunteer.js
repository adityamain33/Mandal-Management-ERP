import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  availability: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Decoration',
      'Security',
      'Prasad',
      'Traffic',
      'Cultural',
      'Social Work',
      'Finance',
      'Digital',
      'Cleaning',
      'Management',
    ],
    default: 'Management',
  },
  hoursWorked: {
    type: Number,
    default: 0,
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
}, {
  timestamps: true,
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);
export default Volunteer;
