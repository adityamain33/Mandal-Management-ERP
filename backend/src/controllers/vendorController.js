import { Vendor, Expense } from '../models/index.js';
import { Op } from 'sequelize';

export const getVendors = async (req, res) => {
  const mandalId = req.mandalId;
  const { search } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { businessName: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
      ];
    }

    const vendors = await Vendor.findAll({ where, order: [['name', 'ASC']] });
    const formatted = vendors.map((v) => {
      const obj = v.toJSON();
      obj._id = v.id;
      return obj;
    });

    res.json(formatted);
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
    const existingVendor = await Vendor.findOne({ where: { mobile: mobile.trim(), mandalId: Number(mandalId) } });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this mobile number already exists' });
    }

    const vendor = await Vendor.create({
      name: name.trim(),
      businessName: businessName ? businessName.trim() : null,
      mobile: mobile.trim(),
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      gstNo: gstNo ? gstNo.trim() : null,
      category: category ? category.trim() : null,
      bankDetails: bankDetails || {},
      notes: notes || null,
      mandalId: Number(mandalId),
    });

    const resObj = vendor.toJSON();
    resObj._id = vendor.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error creating vendor' });
  }
};

export const getVendorProfile = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const vendor = await Vendor.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const rawExpenses = await Expense.findAll({
      where: { vendorId: id, mandalId: Number(mandalId) },
      order: [['date', 'DESC']],
    });

    const expenses = rawExpenses.map((e) => {
      const obj = e.toJSON();
      obj._id = e.id;
      return obj;
    });

    const totalPurchases = expenses.reduce((sum, e) => (e.status !== 'REJECTED' ? sum + Number(e.amount) : sum), 0);
    const totalPaid = expenses.reduce((sum, e) => (e.status === 'PAID' ? sum + Number(e.amount) : sum), 0);
    const pendingAmount = totalPurchases - totalPaid;

    const vObj = vendor.toJSON();
    vObj._id = vendor.id;

    res.json({
      vendor: vObj,
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
    const vendor = await Vendor.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (name) vendor.name = name.trim();
    if (businessName !== undefined) vendor.businessName = businessName;
    if (mobile) vendor.mobile = mobile.trim();
    if (email !== undefined) vendor.email = email ? email.trim() : null;
    if (address !== undefined) vendor.address = address ? address.trim() : null;
    if (gstNo !== undefined) vendor.gstNo = gstNo;
    if (category !== undefined) vendor.category = category;
    if (bankDetails !== undefined) vendor.bankDetails = bankDetails;
    if (notes !== undefined) vendor.notes = notes;

    await vendor.save();
    const resObj = vendor.toJSON();
    resObj._id = vendor.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error updating vendor' });
  }
};
