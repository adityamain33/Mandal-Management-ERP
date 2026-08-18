import Member from '../models/Member.js';

export const getMembers = async (req, res) => {
  const mandalId = req.mandalId;
  const { search, role, status } = req.query;

  try {
    const query = { mandalId };
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search } },
      ];
    }

    const members = await Member.find(query).sort({ role: 1, name: 1 });
    res.json(members);
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
    const existingMember = await Member.findOne({ mobile, mandalId });
    if (existingMember) {
      return res.status(400).json({ message: 'Member with this mobile number already exists' });
    }

    const member = await Member.create({
      name,
      mobile,
      email,
      address,
      dob,
      role,
      bloodGroup,
      emergencyContact,
      photo,
      status,
      mandalId,
    });

    res.status(201).json(member);
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
    const member = await Member.findOne({ _id: id, mandalId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.name = name || member.name;
    member.mobile = mobile || member.mobile;
    member.email = email !== undefined ? email : member.email;
    member.address = address !== undefined ? address : member.address;
    if (dob) member.dob = dob;
    member.role = role || member.role;
    member.bloodGroup = bloodGroup || member.bloodGroup;
    member.emergencyContact = emergencyContact !== undefined ? emergencyContact : member.emergencyContact;
    member.photo = photo !== undefined ? photo : member.photo;
    member.status = status || member.status;

    await member.save();
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error updating member' });
  }
};

export const deleteMember = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const member = await Member.findOneAndDelete({ _id: id, mandalId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting member' });
  }
};
