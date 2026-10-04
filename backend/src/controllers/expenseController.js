import { Expense, Setting, Account, Transaction, Vendor, User, Festival } from '../models/index.js';
import { Op } from 'sequelize';

export const getExpenses = async (req, res) => {
  const mandalId = req.mandalId;
  const { category, status, search } = req.query;

  try {
    const where = { mandalId: Number(mandalId) };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Vendor, as: 'vendor' },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
      order: [['date', 'DESC']],
    });

    const formatted = expenses.map((e) => {
      const obj = e.toJSON();
      obj._id = e.id;
      obj.vendorId = e.vendor ? { ...e.vendor.toJSON(), _id: e.vendor.id } : e.vendorId;
      obj.approvedBy = e.approver ? { ...e.approver.toJSON(), _id: e.approver.id } : e.approvedBy;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving expenses' });
  }
};

export const createExpense = async (req, res) => {
  const mandalId = req.mandalId;
  let { category, description, amount, paymentMode, vendorId, paidBy, notes, billUrl, festivalId } = req.body;

  if (!category || !description || !amount || !paymentMode || !paidBy) {
    return res.status(400).json({ message: 'Category, description, amount, paymentMode, and paidBy are required' });
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
    let settings = await Setting.findOne({ where: { mandalId: Number(mandalId) } });
    if (!settings) {
      settings = await Setting.create({ mandalId: Number(mandalId) });
    }

    const expenseCount = await Expense.count({ where: { mandalId: Number(mandalId) } });
    const sequenceNum = (settings.expenseStartNumber || 1) + expenseCount;
    const formattedNum = String(sequenceNum).padStart(5, '0');
    const prefix = settings.expensePrefix || 'EXP';
    const expenseNo = `${prefix}/${formattedNum}`;

    const expense = await Expense.create({
      expenseNo,
      category,
      description,
      amount: parseFloat(amount),
      paymentMode,
      vendorId: vendorId || null,
      paidBy,
      notes: notes || null,
      billUrl: billUrl || null,
      mandalId: Number(mandalId),
      festivalId: Number(festivalId),
      status: 'PENDING_APPROVAL',
    });

    const resObj = expense.toJSON();
    resObj._id = expense.id;
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

export const approveExpense = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const expense = await Expense.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'APPROVED';
    expense.approvedBy = req.user.id;
    await expense.save();

    const resObj = expense.toJSON();
    resObj._id = expense.id;
    res.json(resObj);
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
    const expense = await Expense.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'REJECTED';
    if (notes) expense.notes = notes;
    await expense.save();

    const resObj = expense.toJSON();
    resObj._id = expense.id;
    res.json(resObj);
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error rejecting expense' });
  }
};

export const payExpense = async (req, res) => {
  const { id } = req.params;
  const mandalId = req.mandalId;

  try {
    const expense = await Expense.findOne({ where: { id, mandalId: Number(mandalId) } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Expense must be APPROVED before marking it as paid' });
    }

    expense.status = 'PAID';
    await expense.save();

    // Log Double Entry accounting Transaction
    let debitAccountCode = '4030'; // Default Miscellaneous
    if (expense.category === 'Decoration') debitAccountCode = '4000';
    else if (expense.category === 'Prasad') debitAccountCode = '4010';
    else if (expense.category === 'Cultural Events') debitAccountCode = '4020';

    const creditAccountCode = expense.paymentMode === 'CASH' ? '1000' : '1010';

    const debitAcc = await Account.findOne({ where: { code: debitAccountCode, mandalId: Number(mandalId) } });
    const creditAcc = await Account.findOne({ where: { code: creditAccountCode, mandalId: Number(mandalId) } });

    if (debitAcc && creditAcc) {
      await Transaction.create({
        description: `Expense Payment - ${expense.expenseNo} (${expense.description})`,
        entries: [
          { accountId: debitAcc.id, amount: expense.amount, type: 'DEBIT' },
          { accountId: creditAcc.id, amount: expense.amount, type: 'CREDIT' },
        ],
        mandalId: Number(mandalId),
        expenseId: expense.id,
      });
    }

    const resObj = expense.toJSON();
    resObj._id = expense.id;
    res.json(resObj);
  } catch (error) {
    console.error('Pay expense error:', error);
    res.status(500).json({ message: 'Server error processing expense payment' });
  }
};
