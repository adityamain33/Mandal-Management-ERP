import { Donation, Expense, Donor, Receipt, Member, Event, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
  const mandalId = req.mandalId;
  if (!mandalId) {
    return res.status(400).json({ message: 'No active Mandal selected' });
  }

  const mId = Number(mandalId);

  try {
    // 1. Total Collection
    const totalDonations = await Donation.sum('amount', {
      where: { mandalId: mId, status: 'PAID' },
    }) || 0;

    // 2. Total Expenses
    const totalExpenses = await Expense.sum('amount', {
      where: { mandalId: mId, status: 'PAID' },
    }) || 0;

    // 3. Today's Collection
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCollection = await Donation.sum('amount', {
      where: {
        mandalId: mId,
        status: 'PAID',
        createdAt: { [Op.gte]: startOfToday },
      },
    }) || 0;

    // 4. Monthly Collection
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCollection = await Donation.sum('amount', {
      where: {
        mandalId: mId,
        status: 'PAID',
        createdAt: { [Op.gte]: startOfMonth },
      },
    }) || 0;

    // 5. Total Donors Count
    const donorsCount = await Donor.count({ where: { mandalId: mId } });

    // 6. Total Receipts Count
    const receiptsCount = await Receipt.count({ where: { mandalId: mId, status: 'ACTIVE' } });

    // 7. Payment Mode Distribution
    const rawPaymentModes = await Donation.findAll({
      attributes: [
        ['paymentMode', 'name'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'value'],
      ],
      where: { mandalId: mId, status: 'PAID' },
      group: ['paymentMode'],
      raw: true,
    });
    const paymentModeData = rawPaymentModes.map((p) => ({
      name: p.name,
      value: Number(p.value || 0),
    }));

    // 8. Purpose Distribution
    const rawPurposes = await Donation.findAll({
      attributes: [
        ['purpose', 'name'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'value'],
      ],
      where: { mandalId: mId, status: 'PAID' },
      group: ['purpose'],
      raw: true,
    });
    const purposeData = rawPurposes.map((p) => ({
      name: p.name,
      value: Number(p.value || 0),
    }));

    // 9. Expense Category Distribution
    const rawCategories = await Expense.findAll({
      attributes: [
        ['category', 'name'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'value'],
      ],
      where: { mandalId: mId, status: 'PAID' },
      group: ['category'],
      raw: true,
    });
    const expenseCategoryData = rawCategories.map((c) => ({
      name: c.name,
      value: Number(c.value || 0),
    }));

    // 10. Monthly Trends (Income vs Expense)
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

      const inc = await Donation.sum('amount', {
        where: {
          mandalId: mId,
          status: 'PAID',
          createdAt: { [Op.between]: [monthStart, monthEnd] },
        },
      }) || 0;

      const exp = await Expense.sum('amount', {
        where: {
          mandalId: mId,
          status: 'PAID',
          date: { [Op.between]: [monthStart, monthEnd] },
        },
      }) || 0;

      trendData.push({
        month: monthName,
        monthMarathi: monthNameMr,
        जमा: Number(inc),
        खर्च: Number(exp),
      });
    }

    // 11. Recent Activities
    const rawRecentDonations = await Donation.findAll({
      where: { mandalId: mId, status: 'PAID' },
      include: [{ model: Donor, as: 'donor', attributes: ['id', 'name', 'mobile'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    const recentDonations = rawRecentDonations.map((d) => {
      const obj = d.toJSON();
      obj._id = d.id;
      obj.donorId = d.donor ? { ...d.donor.toJSON(), _id: d.donor.id } : d.donorId;
      return obj;
    });

    const rawRecentExpenses = await Expense.findAll({
      where: { mandalId: mId, status: 'PAID' },
      order: [['date', 'DESC']],
      limit: 5,
    });
    const recentExpenses = rawRecentExpenses.map((e) => {
      const obj = e.toJSON();
      obj._id = e.id;
      return obj;
    });

    const rawUpcomingEvents = await Event.findAll({
      where: { mandalId: mId, status: 'SCHEDULED' },
      order: [['date', 'ASC']],
      limit: 5,
    });
    const upcomingEvents = rawUpcomingEvents.map((e) => {
      const obj = e.toJSON();
      obj._id = e.id;
      return obj;
    });

    res.json({
      summary: {
        totalDonations: Number(totalDonations),
        totalExpenses: Number(totalExpenses),
        balance: Number(totalDonations - totalExpenses),
        todayCollection: Number(todayCollection),
        monthlyCollection: Number(monthlyCollection),
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
