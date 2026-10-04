import { Setting } from '../models/index.js';

export const getSettings = async (req, res) => {
  const mandalId = req.mandalId;

  try {
    let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
    if (!settings) {
      settings = await Setting.create({ mandalId: Number(mandalId) });
    }
    const resObj = settings.toJSON();
    resObj._id = settings.id;
    res.json(resObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving settings' });
  }
};

export const updateSettings = async (req, res) => {
  const mandalId = req.mandalId;
  const {
    receiptPrefix,
    receiptStartNumber,
    expensePrefix,
    expenseStartNumber,
    paymentModes,
    donationCategories,
    expenseCategories,
    mandalLogo,
    authorizedSignature,
  } = req.body;

  try {
    let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
    if (!settings) {
      settings = await Setting.create({ mandalId: Number(mandalId) });
    }

    if (receiptPrefix !== undefined) settings.receiptPrefix = receiptPrefix;
    if (receiptStartNumber !== undefined) settings.receiptStartNumber = receiptStartNumber;
    if (expensePrefix !== undefined) settings.expensePrefix = expensePrefix;
    if (expenseStartNumber !== undefined) settings.expenseStartNumber = expenseStartNumber;
    if (paymentModes !== undefined) settings.paymentModes = paymentModes;
    if (donationCategories !== undefined) settings.donationCategories = donationCategories;
    if (expenseCategories !== undefined) settings.expenseCategories = expenseCategories;
    if (mandalLogo !== undefined) settings.mandalLogo = mandalLogo;
    if (authorizedSignature !== undefined) settings.authorizedSignature = authorizedSignature;

    await settings.save();
    const resObj = settings.toJSON();
    resObj._id = settings.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};
