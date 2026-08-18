import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const getAccounts = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const accounts = await Account.find({ mandalId }).sort({ code: 1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving accounts' });
  }
};

export const getTransactions = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const transactions = await Transaction.find({ mandalId })
      .populate('entries.accountId')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

export const createTransaction = async (req, res) => {
  const mandalId = req.mandalId;
  const { description, date, entries } = req.body;

  if (!description || !entries || entries.length < 2) {
    return res.status(400).json({ message: 'Description and at least two entries are required' });
  }

  // Verify that Debits equal Credits
  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (entry.type === 'DEBIT') {
      totalDebits += parseFloat(entry.amount);
    } else if (entry.type === 'CREDIT') {
      totalCredits += parseFloat(entry.amount);
    }
  }

  // Handle minor rounding issues (floating point comparison)
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return res.status(400).json({
      message: `Accounting validation error: Debits (₹${totalDebits}) must equal Credits (₹${totalCredits})`,
    });
  }

  try {
    const tx = await Transaction.create({
      description,
      date: date || new Date(),
      entries,
      mandalId,
    });
    res.status(201).json(tx);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error recording transaction' });
  }
};

export const getLedger = async (req, res) => {
  const mandalId = req.mandalId;
  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ message: 'Account ID is required' });
  }

  try {
    const account = await Account.findOne({ _id: accountId, mandalId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Aggregation to pull transactions having entries for this account
    const transactions = await Transaction.find({
      mandalId,
      'entries.accountId': accountId,
    })
      .populate('entries.accountId')
      .sort({ date: 1 });

    let runningBalance = 0;
    const ledgerLines = [];

    for (const tx of transactions) {
      const matchEntry = tx.entries.find((e) => e.accountId._id.toString() === accountId.toString());
      if (matchEntry) {
        const type = matchEntry.type;
        const amount = matchEntry.amount;

        // Increase/decrease based on Account type rules:
        // Asset/Expense increase with DEBIT, decrease with CREDIT
        // Liability/Income/Equity increase with CREDIT, decrease with DEBIT
        const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(account.type);
        if (type === 'DEBIT') {
          runningBalance += isAssetOrExpense ? amount : -amount;
        } else {
          runningBalance += isAssetOrExpense ? -amount : amount;
        }

        ledgerLines.push({
          _id: tx._id,
          date: tx.date,
          description: tx.description,
          type,
          amount,
          balance: runningBalance,
        });
      }
    }

    res.json({
      account,
      ledger: ledgerLines,
      totals: {
        debits: ledgerLines.filter((l) => l.type === 'DEBIT').reduce((sum, l) => sum + l.amount, 0),
        credits: ledgerLines.filter((l) => l.type === 'CREDIT').reduce((sum, l) => sum + l.amount, 0),
        finalBalance: runningBalance,
      },
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ message: 'Server error compiling general ledger' });
  }
};

export const getCashBook = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const cashAcc = await Account.findOne({ code: '1000', mandalId });
    if (!cashAcc) {
      return res.status(404).json({ message: 'Cash Account not found' });
    }
    req.query.accountId = cashAcc._id;
    return getLedger(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating cash book' });
  }
};

export const getBankBook = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const bankAcc = await Account.findOne({ code: '1010', mandalId });
    if (!bankAcc) {
      return res.status(404).json({ message: 'Bank Account not found' });
    }
    req.query.accountId = bankAcc._id;
    return getLedger(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating bank book' });
  }
};

export const getBalanceSummary = async (req, res) => {
  const mandalId = req.mandalId;
  const mId = new mongoose.Types.ObjectId(mandalId);

  try {
    const accounts = await Account.find({ mandalId });

    // Aggregate transactions to find net totals per account
    const summary = [];

    for (const acc of accounts) {
      const results = await Transaction.aggregate([
        { $match: { mandalId: mId } },
        { $unwind: '$entries' },
        { $match: { 'entries.accountId': acc._id } },
        {
          $group: {
            _id: '$entries.type',
            total: { $sum: '$entries.amount' },
          },
        },
      ]);

      const debits = results.find((r) => r._id === 'DEBIT')?.total || 0;
      const credits = results.find((r) => r._id === 'CREDIT')?.total || 0;

      let balance = 0;
      const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(acc.type);
      if (isAssetOrExpense) {
        balance = debits - credits;
      } else {
        balance = credits - debits;
      }

      summary.push({
        _id: acc._id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debits,
        credits,
        balance,
      });
    }

    res.json(summary);
  } catch (error) {
    console.error('Balance summary error:', error);
    res.status(500).json({ message: 'Server error generating balance sheet summary' });
  }
};
