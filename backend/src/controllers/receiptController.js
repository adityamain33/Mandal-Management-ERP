import Receipt from '../models/Receipt.js';
import Donation from '../models/Donation.js';
import Donor from '../models/Donor.js';
import Mandal from '../models/Mandal.js';
import Setting from '../models/Setting.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { generateReceiptPDF } from '../services/pdfService.js';
import fs from 'fs';
import path from 'path';

export const getReceipts = async (req, res) => {
  const mandalId = req.mandalId;
  const { search, mobile, purpose, paymentMode, startDate, endDate, page = 1, limit = 10 } = req.query;

  try {
    const query = { mandalId };

    if (purpose) query.paymentMode = purpose; // Purpose filter
    if (paymentMode) query.paymentMode = paymentMode;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Join and search donors
    let receipts = await Receipt.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate('collectorId', 'name')
      .sort({ createdAt: -1 });

    // Apply client-side text filtering if search query is provided
    if (search || mobile) {
      receipts = receipts.filter((receipt) => {
        const donor = receipt.donationId?.donorId;
        if (!donor) return false;
        
        const donorName = donor.name.toLowerCase();
        const donorMobile = donor.mobile;
        const rNo = receipt.receiptNo.toLowerCase();

        let matches = true;
        if (search) {
          const s = search.toLowerCase();
          matches = donorName.includes(s) || rNo.includes(s);
        }
        if (mobile) {
          matches = matches && donorMobile.includes(mobile);
        }
        return matches;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedReceipts = receipts.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      receipts: paginatedReceipts,
      pagination: {
        total: receipts.length,
        pages: Math.ceil(receipts.length / limit),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ message: 'Server error retrieving receipts' });
  }
};

export const createReceipt = async (req, res) => {
  const mandalId = req.mandalId;
  const { name, mobile, email, address, amount, purpose, paymentMode, notes, festivalId } = req.body;

  if (!name || !mobile || !amount || !purpose || !festivalId) {
    return res.status(400).json({ message: 'Donor name, mobile, amount, purpose, and festival are required' });
  }

  try {
    // 1. Find or create Donor
    let donor = await Donor.findOne({ mobile, mandalId });
    if (!donor) {
      donor = await Donor.create({ name, mobile, email, address, mandalId });
    }

    // 2. Fetch active settings for numbering
    let settings = await Setting.findOne({ mandalId });
    if (!settings) {
      settings = await Setting.create({ mandalId });
    }

    // 3. Generate receipt number sequentially
    const receiptCount = await Receipt.countDocuments({ mandalId });
    const sequenceNum = settings.receiptStartNumber + receiptCount;
    const formattedNum = String(sequenceNum).padStart(5, '0');
    const receiptNo = `${settings.receiptPrefix}/${formattedNum}`;

    // 4. Create Donation
    const donation = await Donation.create({
      donorId: donor._id,
      amount: parseFloat(amount),
      purpose,
      paymentMode,
      status: 'PAID',
      notes,
      collectorId: req.user._id,
      mandalId,
      festivalId,
    });

    // 5. Create Receipt
    const receipt = await Receipt.create({
      receiptNo,
      donationId: donation._id,
      amount: donation.amount,
      paymentMode,
      collectorId: req.user._id,
      mandalId,
    });

    // 6. Log Double Entry accounting Transaction
    // Debit: Cash (1000) or Bank (1010)
    // Credit: Donation Income (3000)
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

    // 7. Generate PDF Receipt
    const mandal = await Mandal.findById(mandalId);
    const pdfPath = await generateReceiptPDF(receipt, donation, donor, mandal, req.user.name);
    
    // Save pdf name/path inside receipt
    receipt.pdfPath = pdfPath;
    await receipt.save();

    res.status(201).json({
      message: 'Receipt generated successfully',
      receipt,
      donation,
      donor,
    });
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ message: 'Server error generating receipt' });
  }
};

export const downloadReceiptPDF = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const receipt = await Receipt.findOne({ _id: id, mandalId });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (!receipt.pdfPath || !fs.existsSync(receipt.pdfPath)) {
      // Re-generate if lost
      const donation = await Donation.findById(receipt.donationId).populate('donorId');
      const donor = donation.donorId;
      const mandal = await Mandal.findById(mandalId);
      const collector = await User.findById(receipt.collectorId);
      const collectorName = collector ? collector.name : 'System';

      const pathPdf = await generateReceiptPDF(receipt, donation, donor, mandal, collectorName);
      receipt.pdfPath = pathPdf;
      await receipt.save();
    }

    res.download(receipt.pdfPath);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Server error downloading receipt' });
  }
};

export const cancelReceipt = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const receipt = await Receipt.findOne({ _id: id, mandalId });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    receipt.status = 'CANCELLED';
    await receipt.save();

    // Cancel donation
    const donation = await Donation.findById(receipt.donationId);
    if (donation) {
      donation.status = 'CANCELLED';
      await donation.save();
    }

    // Reversing Accounting Transaction
    // Debit: Donation Income (3000)
    // Credit: Cash (1000) or Bank (1010)
    const debitAccountCode = '3000';
    const creditAccountCode = receipt.paymentMode === 'CASH' ? '1000' : '1010';

    const debitAcc = await Account.findOne({ code: debitAccountCode, mandalId });
    const creditAcc = await Account.findOne({ code: creditAccountCode, mandalId });

    if (debitAcc && creditAcc) {
      await Transaction.create({
        description: `Reversing transaction - Cancelled Receipt ${receipt.receiptNo}`,
        entries: [
          { accountId: debitAcc._id, amount: receipt.amount, type: 'DEBIT' },
          { accountId: creditAcc._id, amount: receipt.amount, type: 'CREDIT' },
        ],
        mandalId,
        receiptId: receipt._id,
      });
    }

    res.json({ message: 'Receipt cancelled successfully and accounting reversed' });
  } catch (error) {
    console.error('Cancel receipt error:', error);
    res.status(500).json({ message: 'Server error cancelling receipt' });
  }
};
