import User from '../models/User.js';
import Member from '../models/Member.js';
import { MODULE_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, computePermissions } from '../config/permissions.js';

// Get permission metadata & default presets
export const getPermissionsConfig = async (req, res) => {
  try {
    res.json({
      modulePermissions: MODULE_PERMISSIONS,
      roleDefaults: ROLE_DEFAULT_PERMISSIONS,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving permissions config' });
  }
};

// Get all users associated with the current Mandal
export const getMandalUsers = async (req, res) => {
  const mandalId = req.mandalId;

  try {
    const users = await User.find({ 'mandalRoles.mandalId': mandalId })
      .select('-password')
      .populate('memberId', 'name mobile email role status')
      .sort({ createdAt: -1 });

    const formatted = users.map((u) => {
      const mr = u.mandalRoles.find((r) => r.mandalId.toString() === mandalId.toString());
      const role = mr ? mr.role : 'MEMBER';
      const customPermissions = mr?.customPermissions || [];
      const effectivePermissions = computePermissions(role, customPermissions);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        role,
        customPermissions,
        effectivePermissions,
        memberId: u.memberId,
        createdAt: u.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching mandal users:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// Update role and custom permissions of a user in this Mandal
export const updateUserRoleAndPermissions = async (req, res) => {
  const mandalId = req.mandalId;
  const { id } = req.params; // User ID
  const { role, customPermissions } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mrIndex = user.mandalRoles.findIndex(
      (r) => r.mandalId.toString() === mandalId.toString()
    );

    if (mrIndex >= 0) {
      user.mandalRoles[mrIndex].role = role;
      if (Array.isArray(customPermissions)) {
        user.mandalRoles[mrIndex].customPermissions = customPermissions;
      }
    } else {
      user.mandalRoles.push({
        mandalId,
        role,
        customPermissions: Array.isArray(customPermissions) ? customPermissions : [],
      });
    }

    await user.save();

    res.json({
      message: 'User permissions updated successfully',
      role,
      customPermissions: user.mandalRoles[mrIndex >= 0 ? mrIndex : user.mandalRoles.length - 1].customPermissions,
      effectivePermissions: computePermissions(role, customPermissions),
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ message: 'Server error updating user permissions' });
  }
};

// Create or update login credentials for a Member
export const createOrUpdateMemberLogin = async (req, res) => {
  const mandalId = req.mandalId;
  const { memberId } = req.params;
  const { email, mobile, password, role = 'MEMBER', customPermissions = [] } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const member = await Member.findOne({ _id: memberId, mandalId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberEmail = (email || member.email || `${member.mobile}@mandalsetu.local`).toLowerCase().trim();
    const memberMobile = (mobile || member.mobile).trim();

    // Check if user account exists with this email/mobile or memberId
    let user = await User.findOne({
      $or: [
        { memberId: member._id },
        { email: memberEmail },
        { mobile: memberMobile },
      ],
    });

    if (user) {
      // Update existing user
      user.password = password;
      user.memberId = member._id;
      user.name = member.name;
      user.email = memberEmail;
      user.mobile = memberMobile;

      const mrIndex = user.mandalRoles.findIndex(
        (r) => r.mandalId.toString() === mandalId.toString()
      );

      if (mrIndex >= 0) {
        user.mandalRoles[mrIndex].role = role;
        user.mandalRoles[mrIndex].customPermissions = customPermissions;
      } else {
        user.mandalRoles.push({
          mandalId,
          role,
          customPermissions,
        });
      }

      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: member.name,
        email: memberEmail,
        mobile: memberMobile,
        password,
        memberId: member._id,
        activeMandalId: mandalId,
        mandalRoles: [
          {
            mandalId,
            role,
            customPermissions,
          },
        ],
      });
    }

    res.status(200).json({
      message: 'Member login created successfully',
      userId: user._id,
      email: user.email,
      mobile: user.mobile,
      role,
      customPermissions,
    });
  } catch (error) {
    console.error('Error creating member login:', error);
    res.status(500).json({ message: error.message || 'Server error creating member login' });
  }
};
