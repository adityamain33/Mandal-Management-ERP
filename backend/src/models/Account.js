import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'],
  },
  mandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

accountSchema.index({ code: 1, mandalId: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);
export default Account;
