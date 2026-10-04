import { Receipt, Donation, Donor, Mandal, Setting, Account, Transaction, User, Festival } from '../models/index.js';
import { Op } from 'sequelize';
import { generateReceiptPDF } from '../services/pdfService.js';
import fs from 'fs';

export const getReceipts = async (req, res) => {
  const mandalId = req.mandalId;
  const { search, mobile, purpose, paymentMode, startDate, endDate, page = 1, limit = 10 } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };

    if (paymentMode) where.paymentMode = paymentMode;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const allReceipts = await Receipt.findAll({
      where,
      include: [
        {
          model: Donation,
          as: 'donation',
          include: [{ model: Donor, as: 'donor' }],
        },
        {
          model: User,
          as: 'collector',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    let filtered = allReceipts.map((r) => {
      const obj = r.toJSON();
      obj._id = r.id;
      const don = r.donation ? r.donation.toJSON() : null;
      if (don) {
        don._id = don.id;
        if (r.donation.donor) {
          don.donorId = { ...r.donation.donor.toJSON(), _id: r.donation.donor.id };
        }
      }
      obj.donationId = don;
      obj.collectorId = r.collector ? { ...r.collector.toJSON(), _id: r.collector.id } : r.collectorId;
      return obj;
    });

    if (search || mobile) {
      filtered = filtered.filter((receipt) => {
        const donor = receipt.donationId?.donorId;
        const donorName = donor?.name ? donor.name.toLowerCase() : '';
        const donorMobile = donor?.mobile || '';
        const rNo = receipt.receiptNo ? receipt.receiptNo.toLowerCase() : '';

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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedReceipts = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      receipts: paginatedReceipts,
      pagination: {
        total: filtered.length,
        pages: Math.ceil(filtered.length / limitNum) || 1,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ message: 'Server error retrieving receipts' });
  }
};

export const createReceipt = async (req, res) => {
  const mandalId = req.mandalId;
  let { name, mobile, email, address, amount, purpose, paymentMode, notes, festivalId } = req.body;

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

    // 2. Fetch active settings for numbering
    let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
    if (!settings) {
      settings = await Setting.create({ mandalId: Number(mandalId) });
    }

    // 3. Generate receipt number sequentially
    const receiptCount = await Receipt.count({ where: { mandalId: Number(mandalId) } });
    const sequenceNum = (settings.receiptStartNumber || 1) + receiptCount;
    const formattedNum = String(sequenceNum).padStart(5, '0');
    const receiptPrefix = settings.receiptPrefix || 'MS';
    const receiptNo = `${receiptPrefix}/${formattedNum}`;

    // 4. Create Donation
    const donation = await Donation.create({
      donorId: donor.id,
      amount: parseFloat(amount),
      purpose,
      paymentMode,
      status: 'PAID',
      notes: notes || null,
      collectorId: req.user.id,
      mandalId: Number(mandalId),
      festivalId: Number(festivalId),
    });

    // 5. Create Receipt
    const receipt = await Receipt.create({
      receiptNo,
      donationId: donation.id,
      amount: donation.amount,
      paymentMode,
      collectorId: req.user.id,
      mandalId: Number(mandalId),
    });

    // 6. Log Double Entry accounting Transaction
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

    // 7. Generate PDF Receipt
    const mandal = await Mandal.findByPk(mandalId);
    const pdfPath = await generateReceiptPDF(receipt, donation, donor, mandal, req.user.name);
    
    receipt.pdfPath = pdfPath;
    await receipt.save();

    const rObj = receipt.toJSON();
    rObj._id = receipt.id;
    const dObj = donation.toJSON();
    dObj._id = donation.id;
    const donorObj = donor.toJSON();
    donorObj._id = donor.id;

    res.status(201).json({
      message: 'Receipt generated successfully',
      receipt: rObj,
      donation: dObj,
      donor: donorObj,
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
    const receipt = await Receipt.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (!receipt.pdfPath || !fs.existsSync(receipt.pdfPath)) {
      const donation = await Donation.findByPk(receipt.donationId, {
        include: [{ model: Donor, as: 'donor' }],
      });
      const donor = donation?.donor;
      const mandal = await Mandal.findByPk(mandalId);
      const collector = await User.findByPk(receipt.collectorId);
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
    const receipt = await Receipt.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    receipt.status = 'CANCELLED';
    await receipt.save();

    // Cancel donation
    const donation = await Donation.findByPk(receipt.donationId);
    if (donation) {
      donation.status = 'CANCELLED';
      await donation.save();
    }

    // Reversing Accounting Transaction
    const debitAccountCode = '3000';
    const creditAccountCode = receipt.paymentMode === 'CASH' ? '1000' : '1010';

    const debitAcc = await Account.findOne({ where: { code: debitAccountCode, mandalId: Number(mandalId) } });
    const creditAcc = await Account.findOne({ where: { code: creditAccountCode, mandalId: Number(mandalId) } });

    if (debitAcc && creditAcc) {
      await Transaction.create({
        description: `Reversing transaction - Cancelled Receipt ${receipt.receiptNo}`,
        entries: [
          { accountId: debitAcc.id, amount: receipt.amount, type: 'DEBIT' },
          { accountId: creditAcc.id, amount: receipt.amount, type: 'CREDIT' },
        ],
        mandalId: Number(mandalId),
        receiptId: receipt.id,
      });
    }

    res.json({ message: 'Receipt cancelled successfully and accounting reversed' });
  } catch (error) {
    console.error('Cancel receipt error:', error);
    res.status(500).json({ message: 'Server error cancelling receipt' });
  }
};
