import Donation from '../models/Donation.js';
import Donor from '../models/Donor.js';
import Receipt from '../models/Receipt.js';
import Mandal from '../models/Mandal.js';
import Setting from '../models/Setting.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { generateReceiptPDF } from '../services/pdfService.js';

export const getDonations = async (req, res) => {
  const mandalId = req.mandalId;
  const { donorId, purpose, status, date } = req.query;

  try {
    const query = { mandalId };
    if (donorId) query.donorId = donorId;
    if (purpose) query.purpose = purpose;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: start, $lte: end };
    }

    const donations = await Donation.find(query)
      .populate('donorId')
      .populate('collectorId', 'name')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error retrieving donations' });
  }
};

export const createDonation = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, mobile, email, address, amount, purpose, paymentMode, status = 'PENDING', notes, festivalId } = req.body;

  if (!name || !mobile || !amount || !purpose || !festivalId) {
    return res.status(400).json({ message: 'Donor name, mobile, amount, purpose, and festival are required' });
  }

  try {
    // 1. Find or create Donor
    let donor = await Donor.findOne({ mobile, mandalId });
    if (!donor) {
      donor = await Donor.create({ name, mobile, email, address, mandalId });
    }

    // 2. Create Donation
    const donation = await Donation.create({
      donorId: donor._id,
      amount: parseFloat(amount),
      purpose,
      paymentMode,
      status,
      notes,
      collectorId: req.user._id,
      mandalId,
      festivalId,
    });

    // 3. If PAID, generate Receipt and log Accounting
    if (status === 'PAID') {
      let settings = await Setting.findOne({ mandalId });
      if (!settings) settings = await Setting.create({ mandalId });

      const receiptCount = await Receipt.countDocuments({ mandalId });
      const sequenceNum = settings.receiptStartNumber + receiptCount;
      const formattedNum = String(sequenceNum).padStart(5, '0');
      const receiptNo = `${settings.receiptPrefix}/${formattedNum}`;

      const receipt = await Receipt.create({
        receiptNo,
        donationId: donation._id,
        amount: donation.amount,
        paymentMode,
        collectorId: req.user._id,
        mandalId,
      });

      // Double Entry Log
      const debitAccountCode = paymentMode === 'CASH' ? '1000' : '1010';
      const creditAccountCode = '3000';

      const debitAcc = await Account.findOne({ code: debitAccountCode, mandalId });
      const creditAcc = await Account.findOne({ code: creditAccountCode, mandalId });

      if (debitAcc && creditAcc) {
        await Transaction.create({
          description: `Donation received - Receipt ${receiptNo}`,
          entries: [
            { accountId: debitAcc._id, amount: donation.amount, type: 'DEBIT' },
            { accountId: creditAcc._id, amount: donation.amount, type: 'CREDIT' },
          ],
          mandalId,
          donationId: donation._id,
          receiptId: receipt._id,
        });
      }

      // PDF Gen
      const mandal = await Mandal.findById(mandalId);
      const pdfPath = await generateReceiptPDF(receipt, donation, donor, mandal, req.user.name);
      receipt.pdfPath = pdfPath;
      await receipt.save();
    }

    res.status(201).json(donation);
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
    const donation = await Donation.findOne({ _id: id, mandalId }).populate('donorId');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const previousStatus = donation.status;
    donation.status = status;
    await donation.save();

    // If transitioned from PENDING to PAID, generate Receipt and transactions
    if (previousStatus === 'PENDING' && status === 'PAID') {
      let settings = await Setting.findOne({ mandalId });
      if (!settings) settings = await Setting.create({ mandalId });

      const receiptCount = await Receipt.countDocuments({ mandalId });
      const sequenceNum = settings.receiptStartNumber + receiptCount;
      const formattedNum = String(sequenceNum).padStart(5, '0');
      const receiptNo = `${settings.receiptPrefix}/${formattedNum}`;

      const receipt = await Receipt.create({
        receiptNo,
        donationId: donation._id,
        amount: donation.amount,
        paymentMode: donation.paymentMode,
        collectorId: req.user._id,
        mandalId,
      });

      // Double Entry Log
      const debitAccountCode = donation.paymentMode === 'CASH' ? '1000' : '1010';
      const creditAccountCode = '3000';

      const debitAcc = await Account.findOne({ code: debitAccountCode, mandalId });
      const creditAcc = await Account.findOne({ code: creditAccountCode, mandalId });

      if (debitAcc && creditAcc) {
        await Transaction.create({
          description: `Donation received - Receipt ${receiptNo}`,
          entries: [
            { accountId: debitAcc._id, amount: donation.amount, type: 'DEBIT' },
            { accountId: creditAcc._id, amount: donation.amount, type: 'CREDIT' },
          ],
          mandalId,
          donationId: donation._id,
          receiptId: receipt._id,
        });
      }

      // PDF Gen
      const mandal = await Mandal.findById(mandalId);
      const pdfPath = await generateReceiptPDF(receipt, donation, donation.donorId, mandal, req.user.name);
      receipt.pdfPath = pdfPath;
      await receipt.save();
    }

    res.json(donation);
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error updating donation' });
  }
};
