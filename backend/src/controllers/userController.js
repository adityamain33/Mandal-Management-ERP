import { User, Member } from '../models/index.js';
import { Op } from 'sequelize';
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
    const allUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'mobile', 'email', 'role', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const mandalUsers = allUsers.filter((u) => {
      const roles = u.mandalRoles || [];
      return (
        String(u.activeMandalId) === String(mandalId) ||
        roles.some((r) => String(r.mandalId) === String(mandalId))
      );
    });

    const formatted = mandalUsers.map((u) => {
      const roles = u.mandalRoles || [];
      const mr = roles.find((r) => String(r.mandalId) === String(mandalId));
      const role = mr ? mr.role : 'MEMBER';
      const customPermissions = mr?.customPermissions || [];
      const effectivePermissions = computePermissions(role, customPermissions);

      return {
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        role,
        customPermissions,
        effectivePermissions,
        memberId: u.member ? { ...u.member.toJSON(), _id: u.member.id } : null,
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
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mandalRoles = [...(user.mandalRoles || [])];
    const mrIndex = mandalRoles.findIndex(
      (r) => String(r.mandalId) === String(mandalId)
    );

    if (mrIndex >= 0) {
      mandalRoles[mrIndex].role = role;
      if (Array.isArray(customPermissions)) {
        mandalRoles[mrIndex].customPermissions = customPermissions;
      }
    } else {
      mandalRoles.push({
        mandalId: Number(mandalId),
        role,
        customPermissions: Array.isArray(customPermissions) ? customPermissions : [],
      });
    }

    user.mandalRoles = mandalRoles;
    await user.save();

    const activeRoleObj = mandalRoles[mrIndex >= 0 ? mrIndex : mandalRoles.length - 1];

    res.json({
      message: 'User permissions updated successfully',
      role,
      customPermissions: activeRoleObj.customPermissions,
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
    const member = await Member.findOne({ where: { id: memberId, mandalId } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberEmail = (email || member.email || `${member.mobile}@mandalsetu.local`).toLowerCase().trim();
    const memberMobile = (mobile || member.mobile).trim();

    // Check if user account exists with this email/mobile or memberId
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { memberId: member.id },
          { email: memberEmail },
          { mobile: memberMobile },
        ],
      },
    });

    if (user) {
      // Update existing user
      user.password = password;
      user.memberId = member.id;
      user.name = member.name;
      user.email = memberEmail;
      user.mobile = memberMobile;

      const mandalRoles = [...(user.mandalRoles || [])];
      const mrIndex = mandalRoles.findIndex(
        (r) => String(r.mandalId) === String(mandalId)
      );

      if (mrIndex >= 0) {
        mandalRoles[mrIndex].role = role;
        mandalRoles[mrIndex].customPermissions = customPermissions;
      } else {
        mandalRoles.push({
          mandalId: Number(mandalId),
          role,
          customPermissions,
        });
      }

      user.mandalRoles = mandalRoles;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: member.name,
        email: memberEmail,
        mobile: memberMobile,
        password,
        memberId: member.id,
        activeMandalId: Number(mandalId),
        mandalRoles: [
          {
            mandalId: Number(mandalId),
            role,
            customPermissions,
          },
        ],
      });
    }

    res.status(200).json({
      message: 'Member login created successfully',
      _id: user.id,
      id: user.id,
      userId: user.id,
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
