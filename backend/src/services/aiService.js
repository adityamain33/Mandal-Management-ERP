import Donation from '../models/Donation.js';
import Receipt from '../models/Receipt.js';
import Expense from '../models/Expense.js';
import Donor from '../models/Donor.js';
import mongoose from 'mongoose';

/**
 * Process natural language query and return matching insights.
 * @param {string} query - The query text from user
 * @param {string} mandalId - Active Mandal ID
 * @returns {Promise<string>} - Answer in Marathi or English
 */
export const getMandalInsights = async (query, mandalId) => {
  const normalizedQuery = query.toLowerCase().trim();
  const mId = new mongoose.Types.ObjectId(mandalId);

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

        const result = await Donation.aggregate([
          { $match: { mandalId: mId, status: 'PAID', createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const total = result.length > 0 ? result[0].total : 0;
        return `या महिन्यातील एकूण वर्गणी (Total Collection this month) ₹${total.toLocaleString('en-IN')} आहे.`;
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

      const result = await Donation.aggregate([
        { $match: { mandalId: mId, status: 'PAID', createdAt: { $gte: startOfYear } } },
        { $group: { _id: '$donorId', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
      ]);

      if (result.length > 0) {
        const donor = await Donor.findById(result[0]._id);
        const name = donor ? donor.name : 'Unknown';
        return `या वर्षी सर्वात जास्त देणगी ${name} यांनी ₹${result[0].total.toLocaleString('en-IN')} दिली आहे.`;
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

        const count = await Receipt.countDocuments({
          mandalId: mId,
          createdAt: { $gte: startOfToday },
          status: 'ACTIVE'
        });

        const sumResult = await Receipt.aggregate([
          { $match: { mandalId: mId, createdAt: { $gte: startOfToday }, status: 'ACTIVE' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalAmount = sumResult.length > 0 ? sumResult[0].total : 0;

        return `आज एकूण ${count} पावत्या (Receipts) तयार झाल्या आहेत. एकूण जमा: ₹${totalAmount.toLocaleString('en-IN')}.`;
      }
    }

    // 4. Highest Expense Category (कोणत्या category मध्ये सर्वात जास्त खर्च झाला?)
    if (
      normalizedQuery.includes('जास्त खर्च') || 
      normalizedQuery.includes('highest expense') || 
      normalizedQuery.includes('खर्च category')
    ) {
      const result = await Expense.aggregate([
        { $match: { mandalId: mId, status: 'PAID' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
      ]);

      if (result.length > 0) {
        return `सर्वात जास्त खर्च '${result[0]._id}' या श्रेणीमध्ये ₹${result[0].total.toLocaleString('en-IN')} इतका झाला आहे.`;
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
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentMonthResult = await Expense.aggregate([
        { $match: { mandalId: mId, status: 'PAID', date: { $gte: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const lastMonthResult = await Expense.aggregate([
        { $match: { mandalId: mId, status: 'PAID', date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const currentTotal = currentMonthResult.length > 0 ? currentMonthResult[0].total : 0;
      const lastTotal = lastMonthResult.length > 0 ? lastMonthResult[0].total : 0;
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
