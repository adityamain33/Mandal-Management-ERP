import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  activeMandalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandal',
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
  // Map of mandalId to User Role & Permissions
  mandalRoles: [
    {
      mandalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mandal',
        required: true,
      },
      role: {
        type: String,
        enum: [
          'SUPER_ADMIN',
          'MANDAL_ADMIN',
          'TREASURER',
          'ACCOUNTANT',
          'VOLUNTEER_MANAGER',
          'RECEIPT_OPERATOR',
          'EVENT_MANAGER',
          'MEMBER',
          'VIEWER',
        ],
        default: 'MEMBER',
      },
      customPermissions: [
        {
          type: String,
        },
      ],
    },
  ],
}, {
  timestamps: true,
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
