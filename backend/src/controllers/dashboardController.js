import Donation from '../models/Donation.js';
import Expense from '../models/Expense.js';
import Donor from '../models/Donor.js';
import Receipt from '../models/Receipt.js';
import Member from '../models/Member.js';
import Event from '../models/Event.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
  const mandalId = req.mandalId;
  if (!mandalId) {
    return res.status(400).json({ message: 'No active Mandal selected' });
  }

  const mId = new mongoose.Types.ObjectId(mandalId);

  try {
    // 1. Total Collection
    const totalDonationAgg = await Donation.aggregate([
      { $match: { mandalId: mId, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonations = totalDonationAgg.length > 0 ? totalDonationAgg[0].total : 0;

    // 2. Total Expenses
    const totalExpenseAgg = await Expense.aggregate([
      { $match: { mandalId: mId, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].total : 0;

    // 3. Today's Collection
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCollectionAgg = await Donation.aggregate([
      { $match: { mandalId: mId, status: 'PAID', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayCollection = todayCollectionAgg.length > 0 ? todayCollectionAgg[0].total : 0;

    // 4. Monthly Collection
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCollectionAgg = await Donation.aggregate([
      { $match: { mandalId: mId, status: 'PAID', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyCollection = monthlyCollectionAgg.length > 0 ? monthlyCollectionAgg[0].total : 0;

    // 5. Total Donors Count
    const donorsCount = await Donor.countDocuments({ mandalId });

    // 6. Total Receipts Count
    const receiptsCount = await Receipt.countDocuments({ mandalId, status: 'ACTIVE' });

    // 7. Payment Mode Distribution
    const paymentModeData = await Donation.aggregate([
      { $match: { mandalId: mId, status: 'PAID' } },
      { $group: { _id: '$paymentMode', value: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // 8. Purpose Distribution
    const purposeData = await Donation.aggregate([
      { $match: { mandalId: mId, status: 'PAID' } },
      { $group: { _id: '$purpose', value: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // 9. Expense Category Distribution
    const expenseCategoryData = await Expense.aggregate([
      { $match: { mandalId: mId, status: 'PAID' } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // 10. Monthly Trends (Income vs Expense)
    // Get last 6 months
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthNameMr = d.toLocaleString('mr-IN', { month: 'short' });

      const incAgg = await Donation.aggregate([
        { $match: { mandalId: mId, status: 'PAID', createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const expAgg = await Expense.aggregate([
        { $match: { mandalId: mId, status: 'PAID', date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      trendData.push({
        month: monthName,
        monthMarathi: monthNameMr,
        जमा: incAgg.length > 0 ? incAgg[0].total : 0,
        खर्च: expAgg.length > 0 ? expAgg[0].total : 0,
      });
    }

    // 11. Recent Activities
    const recentDonations = await Donation.find({ mandalId, status: 'PAID' })
      .populate('donorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentExpenses = await Expense.find({ mandalId, status: 'PAID' })
      .sort({ date: -1 })
      .limit(5);

    const upcomingEvents = await Event.find({ mandalId, status: 'SCHEDULED' })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      summary: {
        totalDonations,
        totalExpenses,
        balance: totalDonations - totalExpenses,
        todayCollection,
        monthlyCollection,
        donorsCount,
        receiptsCount,
      },
      charts: {
        paymentMode: paymentModeData,
        purpose: purposeData,
        expenseCategory: expenseCategoryData,
        trend: trendData,
      },
      recent: {
        donations: recentDonations,
        expenses: recentExpenses,
        events: upcomingEvents,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard stats' });
  }
};
