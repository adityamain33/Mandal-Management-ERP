import { Donor, Donation } from '../models/index.js';
import { Op } from 'sequelize';

export const getDonors = async (req, res) => {
  const mandalId = req.mandalId;
  const { search } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const donors = await Donor.findAll({ where, order: [['name', 'ASC']] });
    const formatted = donors.map((d) => {
      const obj = d.toJSON();
      obj._id = d.id;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({ message: 'Server error retrieving donors' });
  }
};

export const createDonor = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, mobile, email, address } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ message: 'Name and mobile are required' });
  }

  try {
    const existingDonor = await Donor.findOne({ where: { mobile: mobile.trim(), mandalId: Number(mandalId) } });
    if (existingDonor) {
      return res.status(400).json({ message: 'Donor with this mobile number already exists' });
    }

    const donor = await Donor.create({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      mandalId: Number(mandalId),
    });

    const resObj = donor.toJSON();
    resObj._id = donor.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create donor error:', error);
    res.status(500).json({ message: 'Server error creating donor' });
  }
};

export const getDonorProfile = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const donor = await Donor.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const rawDonations = await Donation.findAll({
      where: { donorId: id, mandalId: Number(mandalId) },
      order: [['createdAt', 'DESC']],
    });

    const donations = rawDonations.map((d) => {
      const obj = d.toJSON();
      obj._id = d.id;
      return obj;
    });

    const totalDonated = donations.reduce((sum, d) => (d.status === 'PAID' ? sum + Number(d.amount) : sum), 0);
    const count = donations.filter((d) => d.status === 'PAID').length;
    const avgDonation = count > 0 ? totalDonated / count : 0;

    const donorObj = donor.toJSON();
    donorObj._id = donor.id;

    res.json({
      donor: donorObj,
      stats: {
        totalDonated,
        count,
        avgDonation,
      },
      donations,
    });
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({ message: 'Server error retrieving donor profile' });
  }
};

export const updateDonor = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { name, mobile, email, address } = req.body;

  try {
    const donor = await Donor.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (name) donor.name = name.trim();
    if (mobile) donor.mobile = mobile.trim();
    if (email !== undefined) donor.email = email ? email.trim() : null;
    if (address !== undefined) donor.address = address ? address.trim() : null;

    await donor.save();
    const resObj = donor.toJSON();
    resObj._id = donor.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update donor error:', error);
    res.status(500).json({ message: 'Server error updating donor' });
  }
};
