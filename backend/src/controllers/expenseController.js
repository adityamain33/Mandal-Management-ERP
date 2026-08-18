import Expense from '../models/Expense.js';
import Setting from '../models/Setting.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

export const getExpenses = async (req, res) => {
  const mandalId = req.mandalId;
  const { category, status, search } = req.query;

  try {
    const query = { mandalId };
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query)
      .populate('vendorId')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving expenses' });
  }
};

export const createExpense = async (req, res) => {
  const mandalId = req.mandalId;
  const { category, description, amount, paymentMode, vendorId, paidBy, notes, billUrl, festivalId } = req.body;

  if (!category || !description || !amount || !paymentMode || !paidBy || !festivalId) {
    return res.status(400).json({ message: 'Category, description, amount, paymentMode, paidBy, and festival are required' });
  }

  try {
    // 1. Fetch settings to generate expense code
    let settings = await Setting.findOne({ mandalId });
    if (!settings) {
      settings = await Setting.create({ mandalId });
    }

    const expenseCount = await Expense.countDocuments({ mandalId });
    const sequenceNum = settings.expenseStartNumber + expenseCount;
    const formattedNum = String(sequenceNum).padStart(5, '0');
    const expenseNo = `${settings.expensePrefix}/${formattedNum}`;

    // 2. Create Expense (Defaults to PENDING_APPROVAL)
    const expense = await Expense.create({
      expenseNo,
      category,
      description,
      amount: parseFloat(amount),
      paymentMode,
      vendorId: vendorId || null,
      paidBy,
      notes,
      billUrl,
      mandalId,
      festivalId,
      status: 'PENDING_APPROVAL',
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

export const approveExpense = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const expense = await Expense.findOne({ _id: id, mandalId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'APPROVED';
    expense.approvedBy = req.user._id;
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Server error approving expense' });
  }
};

export const rejectExpense = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;
  const { notes } = req.body;

  try {
    const expense = await Expense.findOne({ _id: id, mandalId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'REJECTED';
    if (notes) expense.notes = notes;
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error rejecting expense' });
  }
};

export const payExpense = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const expense = await Expense.findOne({ _id: id, mandalId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Expense must be APPROVED before marking it as paid' });
    }

    expense.status = 'PAID';
    await expense.save();

    // Log Double Entry accounting Transaction
    // Debit: Expense Category account
    // Credit: Cash (1000) or Bank (1010)
    let debitAccountCode = '4030'; // Default Miscellaneous
    if (expense.category === 'Decoration') debitAccountCode = '4000';
    else if (expense.category === 'Prasad') debitAccountCode = '4010';
    else if (expense.category === 'Cultural Events') debitAccountCode = '4020';

    const creditAccountCode = expense.paymentMode === 'CASH' ? '1000' : '1010';

    const debitAcc = await Account.findOne({ code: debitAccountCode, mandalId });
    const creditAcc = await Account.findOne({ code: creditAccountCode, mandalId });

    if (debitAcc && creditAcc) {
      await Transaction.create({
        description: `Expense Payment - ${expense.expenseNo} (${expense.description})`,
        entries: [
          { accountId: debitAcc._id, amount: expense.amount, type: 'DEBIT' },
          { accountId: creditAcc._id, amount: expense.amount, type: 'CREDIT' },
        ],
        mandalId,
        expenseId: expense._id,
      });
    }

    res.json(expense);
  } catch (error) {
    console.error('Pay expense error:', error);
    res.status(500).json({ message: 'Server error processing expense payment' });
  }
};
