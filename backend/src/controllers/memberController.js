import { Member } from '../models/index.js';
import { Op } from 'sequelize';

export const getMembers = async (req, res) => {
  const mandalId = req.mandalId;
  const { search, role, status } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
      ];
    }

    const members = await Member.findAll({
      where,
      order: [['role', 'ASC'], ['name', 'ASC']],
    });

    const formatted = members.map((m) => {
      const obj = m.toJSON();
      obj._id = m.id;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error retrieving members' });
  }
};

export const createMember = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, mobile, email, address, dob, role, bloodGroup, emergencyContact, photo, status } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ message: 'Name and mobile are required' });
  }

  try {
    const existingMember = await Member.findOne({ where: { mobile: mobile.trim(), mandalId: Number(mandalId) } });
    if (existingMember) {
      return res.status(400).json({ message: 'Member with this mobile number already exists' });
    }

    const member = await Member.create({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      dob: dob || null,
      role: role || 'Member',
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact || null,
      photo: photo || null,
      status: status || 'ACTIVE',
      mandalId: Number(mandalId),
    });

    const resObj = member.toJSON();
    resObj._id = member.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: 'Server error creating member' });
  }
};

export const updateMember = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { name, mobile, email, address, dob, role, bloodGroup, emergencyContact, photo, status } = req.body;

  try {
    const member = await Member.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (name) member.name = name.trim();
    if (mobile) member.mobile = mobile.trim();
    if (email !== undefined) member.email = email ? email.trim() : null;
    if (address !== undefined) member.address = address ? address.trim() : null;
    if (dob) member.dob = dob;
    if (role) member.role = role;
    if (bloodGroup) member.bloodGroup = bloodGroup;
    if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;
    if (photo !== undefined) member.photo = photo;
    if (status) member.status = status;

    await member.save();
    const resObj = member.toJSON();
    resObj._id = member.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error updating member' });
  }
};

export const deleteMember = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const member = await Member.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    await member.destroy();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting member' });
  }
};
