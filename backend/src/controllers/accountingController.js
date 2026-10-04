import { Account, Transaction } from '../models/index.js';

export const getAccounts = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const accounts = await Account.findAll({
      where: { mandalId: Number(mandalId) },
      order: [['code', 'ASC']],
    });
    const formatted = accounts.map((a) => {
      const obj = a.toJSON();
      obj._id = a.id;
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving accounts' });
  }
};

export const getTransactions = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const transactions = await Transaction.findAll({
      where: { mandalId: Number(mandalId) },
      order: [['date', 'DESC']],
    });

    // Populate account details inside entries
    const accounts = await Account.findAll({ where: { mandalId: Number(mandalId) } });
    const accMap = {};
    accounts.forEach((a) => {
      accMap[String(a.id)] = { ...a.toJSON(), _id: a.id };
    });

    const formatted = transactions.map((t) => {
      const obj = t.toJSON();
      obj._id = t.id;
      const populatedEntries = (obj.entries || []).map((e) => {
        const accId = e.accountId?._id || e.accountId?.id || e.accountId;
        return {
          ...e,
          accountId: accMap[String(accId)] || e.accountId,
        };
      });
      obj.entries = populatedEntries;
      return obj;
    });

    res.json(formatted);
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

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return res.status(400).json({
      message: `Accounting validation error: Debits (₹${totalDebits}) must equal Credits (₹${totalCredits})`,
    });
  }

  try {
    const formattedEntries = entries.map((e) => ({
      accountId: Number(e.accountId?._id || e.accountId?.id || e.accountId),
      amount: parseFloat(e.amount),
      type: e.type,
    }));

    const tx = await Transaction.create({
      description,
      date: date || new Date(),
      entries: formattedEntries,
      mandalId: Number(mandalId),
    });

    const resObj = tx.toJSON();
    resObj._id = tx.id;
    res.status(201).json(resObj);
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
    const account = await Account.findOne({ where: { id: accountId, mandalId: Number(mandalId) } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const allTx = await Transaction.findAll({
      where: { mandalId: Number(mandalId) },
      order: [['date', 'ASC']],
    });

    let runningBalance = 0;
    const ledgerLines = [];

    for (const tx of allTx) {
      const entries = tx.entries || [];
      const matchEntry = entries.find((e) => {
        const id = e.accountId?._id || e.accountId?.id || e.accountId;
        return String(id) === String(accountId);
      });

      if (matchEntry) {
        const type = matchEntry.type;
        const amount = Number(matchEntry.amount);

        const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(account.type);
        if (type === 'DEBIT') {
          runningBalance += isAssetOrExpense ? amount : -amount;
        } else {
          runningBalance += isAssetOrExpense ? -amount : amount;
        }

        ledgerLines.push({
          _id: tx.id,
          id: tx.id,
          date: tx.date,
          description: tx.description,
          type,
          amount,
          balance: runningBalance,
        });
      }
    }

    const accObj = account.toJSON();
    accObj._id = account.id;

    res.json({
      account: accObj,
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
    const cashAcc = await Account.findOne({ where: { code: '1000', mandalId: Number(mandalId) } });
    if (!cashAcc) {
      return res.status(404).json({ message: 'Cash Account not found' });
    }
    req.query.accountId = cashAcc.id;
    return getLedger(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating cash book' });
  }
};

export const getBankBook = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const bankAcc = await Account.findOne({ where: { code: '1010', mandalId: Number(mandalId) } });
    if (!bankAcc) {
      return res.status(404).json({ message: 'Bank Account not found' });
    }
    req.query.accountId = bankAcc.id;
    return getLedger(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating bank book' });
  }
};

export const getBalanceSummary = async (req, res) => {
  const mandalId = req.mandalId;

  try {
    const accounts = await Account.findAll({ where: { mandalId: Number(mandalId) } });
    const allTx = await Transaction.findAll({ where: { mandalId: Number(mandalId) } });

    const summary = [];

    for (const acc of accounts) {
      let debits = 0;
      let credits = 0;

      for (const tx of allTx) {
        const entries = tx.entries || [];
        for (const entry of entries) {
          const accId = entry.accountId?._id || entry.accountId?.id || entry.accountId;
          if (String(accId) === String(acc.id)) {
            if (entry.type === 'DEBIT') {
              debits += Number(entry.amount);
            } else if (entry.type === 'CREDIT') {
              credits += Number(entry.amount);
            }
          }
        }
      }

      let balance = 0;
      const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(acc.type);
      if (isAssetOrExpense) {
        balance = debits - credits;
      } else {
        balance = credits - debits;
      }

      summary.push({
        _id: acc.id,
        id: acc.id,
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
