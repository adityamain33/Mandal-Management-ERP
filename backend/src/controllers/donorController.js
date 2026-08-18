import Donor from '../models/Donor.js';
import Donation from '../models/Donation.js';

export const getDonors = async (req, res) => {
  const mandalId = req.mandalId;
  const { search } = req.query;

  try {
    const query = { mandalId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const donors = await Donor.find(query).sort({ name: 1 });
    res.json(donors);
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
    const existingDonor = await Donor.findOne({ mobile, mandalId });
    if (existingDonor) {
      return res.status(400).json({ message: 'Donor with this mobile number already exists' });
    }

    const donor = await Donor.create({ name, mobile, email, address, mandalId });
    res.status(201).json(donor);
  } catch (error) {
    console.error('Create donor error:', error);
    res.status(500).json({ message: 'Server error creating donor' });
  }
};

export const getDonorProfile = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const donor = await Donor.findOne({ _id: id, mandalId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donations = await Donation.find({ donorId: id, mandalId }).sort({ createdAt: -1 });

    const totalDonated = donations.reduce((sum, d) => (d.status === 'PAID' ? sum + d.amount : sum), 0);
    const count = donations.filter((d) => d.status === 'PAID').length;
    const avgDonation = count > 0 ? totalDonated / count : 0;

    res.json({
      donor,
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
    const donor = await Donor.findOne({ _id: id, mandalId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.name = name || donor.name;
    donor.mobile = mobile || donor.mobile;
    donor.email = email !== undefined ? email : donor.email;
    donor.address = address !== undefined ? address : donor.address;

    await donor.save();
    res.json(donor);
  } catch (error) {
    console.error('Update donor error:', error);
    res.status(500).json({ message: 'Server error updating donor' });
  }
};
