import { Donation, Receipt, Expense, Donor, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Process natural language query and return matching insights.
 * @param {string} query - The query text from user
 * @param {number|string} mandalId - Active Mandal ID
 * @returns {Promise<string>} - Answer in Marathi or English
 */
export const getMandalInsights = async (query, mandalId) => {
  const normalizedQuery = (query || '').toLowerCase().trim();
  const mId = Number(mandalId);

  try {
    // 1. Total donation this month (या महिन्यातील एकूण वर्गणी किती आहे?)
    if (
      normalizedQuery.includes('वर्गणी') || 
      normalizedQuery.includes('donation') || 
      normalizedQuery.includes('collection')
    ) {
      if (normalizedQuery.includes('महिना') || normalizedQuery.includes('month')) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const total = await Donation.sum('amount', {
          where: {
            mandalId: mId,
            status: 'PAID',
            createdAt: { [Op.gte]: startOfMonth },
          },
        }) || 0;

        return `या महिन्यातील एकूण वर्गणी (Total Collection this month) ₹${Number(total).toLocaleString('en-IN')} आहे.`;
      }
    }

    // 2. Highest donation this year / Top donor (या वर्षी सर्वात जास्त देणगी कोणी दिली?)
    if (
      normalizedQuery.includes('जास्त देणगी') || 
      normalizedQuery.includes('highest donation') || 
      normalizedQuery.includes('top donor')
    ) {
      const startOfYear = new Date();
      startOfYear.setMonth(0);
      startOfYear.setDate(1);
      startOfYear.setHours(0, 0, 0, 0);

      const topDonation = await Donation.findOne({
        where: {
          mandalId: mId,
          status: 'PAID',
          createdAt: { [Op.gte]: startOfYear },
        },
        include: [{ model: Donor, as: 'donor' }],
        order: [['amount', 'DESC']],
      });

      if (topDonation) {
        const name = topDonation.donor ? topDonation.donor.name : 'Unknown';
        return `या वर्षी सर्वात जास्त देणगी ${name} यांनी ₹${Number(topDonation.amount).toLocaleString('en-IN')} दिली आहे.`;
      }
      return 'या वर्षी अजून कोणतीही देणगी मिळालेली नाही.';
    }

    // 3. Today's receipts (आज किती receipts generate झाल्या?)
    if (
      normalizedQuery.includes('receipt') || 
      normalizedQuery.includes('पावत्या') || 
      normalizedQuery.includes('पावती')
    ) {
      if (normalizedQuery.includes('आज') || normalizedQuery.includes('today')) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const count = await Receipt.count({
          where: {
            mandalId: mId,
            createdAt: { [Op.gte]: startOfToday },
            status: 'ACTIVE',
          },
        });

        const totalAmount = await Receipt.sum('amount', {
          where: {
            mandalId: mId,
            createdAt: { [Op.gte]: startOfToday },
            status: 'ACTIVE',
          },
        }) || 0;

        return `आज एकूण ${count} पावत्या (Receipts) तयार झाल्या आहेत. एकूण जमा: ₹${Number(totalAmount).toLocaleString('en-IN')}.`;
      }
    }

    // 4. Highest Expense Category (कोणत्या category मध्ये सर्वात जास्त खर्च झाला?)
    if (
      normalizedQuery.includes('जास्त खर्च') || 
      normalizedQuery.includes('highest expense') || 
      normalizedQuery.includes('खर्च category')
    ) {
      const result = await Expense.findAll({
        attributes: [
          'category',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        ],
        where: { mandalId: mId, status: 'PAID' },
        group: ['category'],
        order: [[sequelize.literal('total'), 'DESC']],
        limit: 1,
        raw: true,
      });

      if (result.length > 0) {
        return `सर्वात जास्त खर्च '${result[0].category}' या श्रेणीमध्ये ₹${Number(result[0].total).toLocaleString('en-IN')} इतका झाला आहे.`;
      }
      return 'खर्चाचा कोणताही तपशील उपलब्ध नाही.';
    }

    // 5. Expense Comparison to last month (मागील महिन्यापेक्षा खर्च किती वाढला?)
    if (
      normalizedQuery.includes('खर्च किती वाढला') || 
      normalizedQuery.includes('expense comparison') || 
      normalizedQuery.includes('मागील महिन्यापेक्षा')
    ) {
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const currentTotal = await Expense.sum('amount', {
        where: {
          mandalId: mId,
          status: 'PAID',
          date: { [Op.gte]: startOfCurrentMonth },
        },
      }) || 0;

      const lastTotal = await Expense.sum('amount', {
        where: {
          mandalId: mId,
          status: 'PAID',
          date: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        },
      }) || 0;

      const diff = currentTotal - lastTotal;

      if (diff > 0) {
        return `या महिन्यात मागील महिन्यापेक्षा ₹${diff.toLocaleString('en-IN')} जास्त खर्च झाला आहे. (चालू महिना: ₹${currentTotal.toLocaleString('en-IN')}, मागील महिना: ₹${lastTotal.toLocaleString('en-IN')})`;
      } else if (diff < 0) {
        return `या महिन्यात मागील महिन्यापेक्षा ₹${Math.abs(diff).toLocaleString('en-IN')} कमी खर्च झाला आहे. (चालू महिना: ₹${currentTotal.toLocaleString('en-IN')}, मागील महिना: ₹${lastTotal.toLocaleString('en-IN')})`;
      } else {
        return `दोन्ही महिन्यांचा खर्च समान (₹${currentTotal.toLocaleString('en-IN')}) आहे.`;
      }
    }

    // Generic response with helpful hints
    return `क्षमस्व, मला त्या प्रश्नाचे उत्तर शोधता आले नाही. कृपया खालीलपैकी काहीतरी विचारून पहा:
1. या महिन्यातील एकूण वर्गणी किती आहे?
2. या वर्षी सर्वात जास्त देणगी कोणी दिली?
3. आज किती receipts generate झाल्या?
4. कोणत्या category मध्ये सर्वात जास्त खर्च झाला?
5. मागील महिन्यापेक्षा खर्च किती वाढला?`;
  } catch (error) {
    console.error('Insights error:', error);
    return 'माहिती शोधताना काहीतरी तांत्रिक अडचण आली. कृपया नंतर प्रयत्न करा.';
  }
};
