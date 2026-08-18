import Vendor from '../models/Vendor.js';
import Expense from '../models/Expense.js';

export const getVendors = async (req, res) => {
  const mandalId = req.mandalId;
  const { search } = req.query;

  try {
    const query = { mandalId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ name: 1 });
    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error retrieving vendors' });
  }
};

export const createVendor = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, businessName, mobile, email, address, gstNo, category, bankDetails, notes } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ message: 'Name and mobile are required' });
  }

  try {
    const existingVendor = await Vendor.findOne({ mobile, mandalId });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this mobile number already exists' });
    }

    const vendor = await Vendor.create({
      name,
      businessName,
      mobile,
      email,
      address,
      gstNo,
      category,
      bankDetails,
      notes,
      mandalId,
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error creating vendor' });
  }
};

export const getVendorProfile = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const vendor = await Vendor.findOne({ _id: id, mandalId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const expenses = await Expense.find({ vendorId: id, mandalId }).sort({ date: -1 });

    const totalPurchases = expenses.reduce((sum, e) => (e.status !== 'REJECTED' ? sum + e.amount : sum), 0);
    const totalPaid = expenses.reduce((sum, e) => (e.status === 'PAID' ? sum + e.amount : sum), 0);
    const pendingAmount = totalPurchases - totalPaid;

    res.json({
      vendor,
      stats: {
        totalPurchases,
        totalPaid,
        pendingAmount,
      },
      expenses,
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ message: 'Server error retrieving vendor profile' });
  }
};

export const updateVendor = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { name, businessName, mobile, email, address, gstNo, category, bankDetails, notes } = req.body;

  try {
    const vendor = await Vendor.findOne({ _id: id, mandalId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.name = name || vendor.name;
    vendor.businessName = businessName !== undefined ? businessName : vendor.businessName;
    vendor.mobile = mobile || vendor.mobile;
    vendor.email = email !== undefined ? email : vendor.email;
    vendor.address = address !== undefined ? address : vendor.address;
    vendor.gstNo = gstNo !== undefined ? gstNo : vendor.gstNo;
    vendor.category = category !== undefined ? category : vendor.category;
    vendor.bankDetails = bankDetails !== undefined ? bankDetails : vendor.bankDetails;
    vendor.notes = notes !== undefined ? notes : vendor.notes;

    await vendor.save();
    res.json(vendor);
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error updating vendor' });
  }
};
