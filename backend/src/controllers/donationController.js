import { Donation, Donor, Receipt, Mandal, Setting, Account, Transaction, User, Festival } from '../models/index.js';
import { Op } from 'sequelize';
import { generateReceiptPDF } from '../services/pdfService.js';

export const getDonations = async (req, res) => {
  const mandalId = req.mandalId;
  const { donorId, purpose, status, date } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (donorId) where.donorId = donorId;
    if (purpose) where.purpose = purpose;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.createdAt = { [Op.between]: [start, end] };
    }

    const donations = await Donation.findAll({
      where,
      include: [
        { model: Donor, as: 'donor' },
        { model: User, as: 'collector', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formatted = donations.map((d) => {
      const obj = d.toJSON();
      obj._id = d.id;
      obj.donorId = d.donor ? { ...d.donor.toJSON(), _id: d.donor.id } : d.donorId;
      obj.collectorId = d.collector ? { ...d.collector.toJSON(), _id: d.collector.id } : d.collectorId;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error retrieving donations' });
  }
};

export const createDonation = async (req, res) => {
  const mandalId = req.mandalId;
  let { name, mobile, email, address, amount, purpose, paymentMode, status = 'PENDING', notes, festivalId } = req.body;

  if (!name || !mobile || !amount || !purpose) {
    return res.status(400).json({ message: 'Donor name, mobile, amount, and purpose are required' });
  }

  try {
    // If festivalId is not passed, lookup active festival
    if (!festivalId) {
      const activeFest = await Festival.findOne({ where: { mandalId: Number(mandalId), status: 'ACTIVE' } });
      if (activeFest) {
        festivalId = activeFest.id;
      } else {
        const anyFest = await Festival.findOne({ where: { mandalId: Number(mandalId) } });
        if (anyFest) festivalId = anyFest.id;
      }
    }

    if (!festivalId) {
      return res.status(400).json({ message: 'No festival found for this mandal. Please create an active festival in settings.' });
    }
    // 1. Find or create Donor
    let donor = await Donor.findOne({ where: { mobile: mobile.trim(), mandalId: Number(mandalId) } });
    if (!donor) {
      donor = await Donor.create({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        mandalId: Number(mandalId),
      });
    }

    // 2. Create Donation
    const donation = await Donation.create({
      donorId: donor.id,
      amount: parseFloat(amount),
      purpose,
      paymentMode,
      status,
      notes: notes || null,
      collectorId: req.user.id,
      mandalId: Number(mandalId),
      festivalId: Number(festivalId),
    });

    // 3. If PAID, generate Receipt and log Accounting
    if (status === 'PAID') {
      let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
      if (!settings) settings = await Setting.create({ mandalId: Number(mandalId) });

      const receiptCount = await Receipt.count({ where: { mandalId: Number(mandalId) } });
      const sequenceNum = (settings.receiptStartNumber || 1) + receiptCount;
      const formattedNum = String(sequenceNum).padStart(5, '0');
      const receiptPrefix = settings.receiptPrefix || 'MS';
      const receiptNo = `${receiptPrefix}/${formattedNum}`;

      const receipt = await Receipt.create({
        receiptNo,
        donationId: donation.id,
        amount: donation.amount,
        paymentMode,
        collectorId: req.user.id,
        mandalId: Number(mandalId),
      });

      // Double Entry Log
      const debitAccountCode = paymentMode === 'CASH' ? '1000' : '1010';
      const creditAccountCode = '3000';

      const debitAcc = await Account.findOne({ where: { code: debitAccountCode, mandalId: Number(mandalId) } });
      const creditAcc = await Account.findOne({ where: { code: creditAccountCode, mandalId: Number(mandalId) } });

      if (debitAcc && creditAcc) {
        await Transaction.create({
          description: `Donation received - Receipt ${receiptNo}`,
          entries: [
            { accountId: debitAcc.id, amount: donation.amount, type: 'DEBIT' },
            { accountId: creditAcc.id, amount: donation.amount, type: 'CREDIT' },
          ],
          mandalId: Number(mandalId),
          donationId: donation.id,
          receiptId: receipt.id,
        });
      }

      // PDF Gen
      const mandal = await Mandal.findByPk(mandalId);
      const pdfPath = await generateReceiptPDF(receipt, donation, donor, mandal, req.user.name);
      receipt.pdfPath = pdfPath;
      await receipt.save();
    }

    const resObj = donation.toJSON();
    resObj._id = donation.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error creating donation' });
  }
};

export const updateDonationStatus = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { status } = req.body; // e.g. PAID or CANCELLED

  try {
    const donation = await Donation.findOne({
      where: { id, mandalId: Number(mandalId) },
      include: [{ model: Donor, as: 'donor' }],
    });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const previousStatus = donation.status;
    donation.status = status;
    await donation.save();

    // If transitioned from PENDING to PAID, generate Receipt and transactions
    if (previousStatus === 'PENDING' && status === 'PAID') {
      let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
      if (!settings) settings = await Setting.create({ mandalId: Number(mandalId) });

      const receiptCount = await Receipt.count({ where: { mandalId: Number(mandalId) } });
      const sequenceNum = (settings.receiptStartNumber || 1) + receiptCount;
      const formattedNum = String(sequenceNum).padStart(5, '0');
      const receiptPrefix = settings.receiptPrefix || 'MS';
      const receiptNo = `${receiptPrefix}/${formattedNum}`;

      const receipt = await Receipt.create({
        receiptNo,
        donationId: donation.id,
        amount: donation.amount,
        paymentMode: donation.paymentMode,
        collectorId: req.user.id,
        mandalId: Number(mandalId),
      });

      // Double Entry Log
      const debitAccountCode = donation.paymentMode === 'CASH' ? '1000' : '1010';
      const creditAccountCode = '3000';

      const debitAcc = await Account.findOne({ where: { code: debitAccountCode, mandalId: Number(mandalId) } });
      const creditAcc = await Account.findOne({ where: { code: creditAccountCode, mandalId: Number(mandalId) } });

      if (debitAcc && creditAcc) {
        await Transaction.create({
          description: `Donation received - Receipt ${receiptNo}`,
          entries: [
            { accountId: debitAcc.id, amount: donation.amount, type: 'DEBIT' },
            { accountId: creditAcc.id, amount: donation.amount, type: 'CREDIT' },
          ],
          mandalId: Number(mandalId),
          donationId: donation.id,
          receiptId: receipt.id,
        });
      }

      // PDF Gen
      const mandal = await Mandal.findByPk(mandalId);
      const pdfPath = await generateReceiptPDF(receipt, donation, donation.donor, mandal, req.user.name);
      receipt.pdfPath = pdfPath;
      await receipt.save();
    }

    const resObj = donation.toJSON();
    resObj._id = donation.id;
    res.json(resObj);
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error updating donation' });
  }
};
