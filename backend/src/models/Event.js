import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // format HH:MM
    required: true,
  },
  endTime: {
    type: String, // format HH:MM
  },
  location: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  budget: {
    type: Number,
    default: 0,
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
  volunteers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
    },
  ],
  status: {
    type: String,
    enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
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

const Event = mongoose.model('Event', eventSchema);
export default Event;
