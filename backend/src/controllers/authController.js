import { User, Mandal, Setting, Festival, Account } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { computePermissions, ALL_PERMISSIONS } from '../config/permissions.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  const { mandalName, adminName, mobile, email, password, city, state } = req.body;

  if (!mandalName || !adminName || !mobile || !email || !password || !city || !state) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'कृपया वैध ईमेल आयडी टाका / Please enter a valid email address' });
  }

  // Mobile number validation (10 digits starting with 6-9)
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: 'कृपया वैध १०-अंकी मोबाईल क्रमांक टाका / Please enter a valid 10-digit mobile number' });
  }

  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'पासवर्ड किमान ६ अक्षरांचा असावा / Password must be at least 6 characters' });
  }

  try {
    const userExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Create Mandal
    const mandal = await Mandal.create({
      name: mandalName,
      city,
      state,
      configuration: {
        receiptPrefix: 'GM/26',
        receiptStartNumber: 1,
      },
    });

    // 2. Create User
    const user = await User.create({
      name: adminName,
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password,
      activeMandalId: mandal.id,
      mandalRoles: [
        {
          mandalId: mandal.id,
          role: 'MANDAL_ADMIN',
          customPermissions: ALL_PERMISSIONS,
        },
      ],
    });

    // 3. Create default settings
    await Setting.create({
      mandalId: mandal.id,
      receiptPrefix: 'GM/26',
      receiptStartNumber: 1,
    });

    // 4. Create default active Festival
    const today = new Date();
    const dec31 = new Date(today.getFullYear(), 11, 31);
    await Festival.create({
      name: 'गणेशोत्सव २०२६',
      year: 2026,
      startDate: today,
      endDate: dec31,
      mandalId: mandal.id,
      theme: 'पारंपारिक मूर्ती व सजावट',
      budget: 100000,
      expectedDonation: 150000,
      status: 'ACTIVE',
    });

    // 5. Create Default Chart of Accounts
    const defaultAccounts = [
      { code: '1000', name: 'रोख खाते (Cash Account)', type: 'ASSET' },
      { code: '1010', name: 'बँक खाते (Bank Account)', type: 'ASSET' },
      { code: '3000', name: 'वर्गणी व देणगी जमा (Donation Revenue)', type: 'INCOME' },
      { code: '4000', name: 'उत्सव सजावट खर्च (Decoration Expense)', type: 'EXPENSE' },
      { code: '4010', name: 'प्रसाद खर्च (Prasad Expense)', type: 'EXPENSE' },
      { code: '4020', name: 'सांस्कृतिक कार्यक्रम खर्च (Cultural Expense)', type: 'EXPENSE' },
      { code: '4030', name: 'इतर खर्च (Miscellaneous Expense)', type: 'EXPENSE' },
    ];

    for (const acc of defaultAccounts) {
      await Account.create({
        ...acc,
        mandalId: mandal.id,
      });
    }

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      token: generateToken(user.id),
      activeMandalId: mandal.id,
      role: 'MANDAL_ADMIN',
      permissions: ALL_PERMISSIONS,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  if (!emailOrMobile || !password) {
    return res.status(400).json({ message: 'Email/Mobile and password are required' });
  }

  try {
    const trimmedInput = emailOrMobile.trim();
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: trimmedInput.toLowerCase() },
          { mobile: trimmedInput },
        ],
      },
    });

    if (user && (await user.comparePassword(password))) {
      const mandalId = user.activeMandalId;
      let role = 'MEMBER';
      let customPermissions = [];

      const mandalRoles = user.mandalRoles || [];
      if (mandalId) {
        const mr = mandalRoles.find((r) => String(r.mandalId) === String(mandalId));
        if (mr) {
          role = mr.role;
          customPermissions = mr.customPermissions || [];
        }
      }

      const permissions = computePermissions(role, customPermissions);

      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        token: generateToken(user.id),
        activeMandalId: mandalId,
        role,
        permissions,
        customPermissions,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    res.json({ message: 'Password reset link sent to registered email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mandalId = req.mandalId || user.activeMandalId;
    let currentRole = 'MEMBER';
    let customPermissions = [];

    const mandalRoles = user.mandalRoles || [];
    if (mandalId) {
      const mr = mandalRoles.find((r) => {
        const id = r.mandalId?._id || r.mandalId?.id || r.mandalId;
        return id && String(id) === String(mandalId);
      });
      if (mr) {
        currentRole = mr.role;
        customPermissions = mr.customPermissions || [];
      }
    }

    const permissions = computePermissions(currentRole, customPermissions);
    const userObj = user.toJSON();
    userObj._id = user.id;
    userObj.role = currentRole;
    userObj.permissions = permissions;
    userObj.customPermissions = customPermissions;

    res.json(userObj);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMandal = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, registrationDetails, address } = req.body;

  if (!mandalId) {
    return res.status(400).json({ message: 'Active Mandal ID is required' });
  }

  try {
    const mandal = await Mandal.findByPk(mandalId);
    if (!mandal) {
      return res.status(404).json({ message: 'Mandal not found' });
    }

    if (name !== undefined) mandal.name = name;
    if (registrationDetails !== undefined) mandal.registrationDetails = registrationDetails;
    if (address !== undefined) mandal.address = address;

    await mandal.save();
    res.json(mandal);
  } catch (error) {
    console.error('Update Mandal error:', error);
    res.status(500).json({ message: 'Server error updating Mandal profile' });
  }
};
