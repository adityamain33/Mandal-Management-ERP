import Donation from '../models/Donation.js';
import Receipt from '../models/Receipt.js';
import Expense from '../models/Expense.js';
import { exportToExcel, exportToCSV } from '../services/exportService.js';

export const getProfitLossReport = async (req, res) => {
  const mandalId = req.mandalId;

  try {
    const donations = await Donation.find({ mandalId, status: 'PAID' });
    const expenses = await Expense.find({ mandalId, status: 'PAID' });

    const totalIncome = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group income by purpose
    const incomeByPurpose = donations.reduce((acc, curr) => {
      acc[curr.purpose] = (acc[curr.purpose] || 0) + curr.amount;
      return acc;
    }, {});

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netSurplus: totalIncome - totalExpenses,
      },
      incomeDetails: Object.keys(incomeByPurpose).map((k) => ({ purpose: k, amount: incomeByPurpose[k] })),
      expenseDetails: Object.keys(expensesByCategory).map((k) => ({ category: k, amount: expensesByCategory[k] })),
    });
  } catch (error) {
    console.error('Profit Loss report error:', error);
    res.status(500).json({ message: 'Server error generating financial report' });
  }
};

export const exportDonationsReport = async (req, res) => {
  const mandalId = req.mandalId;
  const { format = 'xlsx' } = req.query;

  try {
    const donations = await Donation.find({ mandalId }).populate('donorId', 'name mobile email');
    
    // Flatten data for export
    const exportData = donations.map((d) => ({
      'Donation Date': new Date(d.createdAt).toLocaleDateString(),
      'Donor Name': d.donorId?.name || 'N/A',
      'Mobile': d.donorId?.mobile || 'N/A',
      'Purpose': d.purpose,
      'Payment Mode': d.paymentMode,
      'Amount (INR)': d.amount,
      'Status': d.status,
      'Notes': d.notes || '',
    }));

    if (format === 'csv') {
      const csvStr = exportToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=donations_report.csv');
      return res.send(csvStr);
    } else {
      const excelBuf = exportToExcel(exportData, 'Donations');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=donations_report.xlsx');
      return res.send(excelBuf);
    }
  } catch (error) {
    console.error('Export donations error:', error);
    res.status(500).json({ message: 'Server error exporting report' });
  }
};

export const exportReceiptsReport = async (req, res) => {
  const mandalId = req.mandalId;
  const { format = 'xlsx' } = req.query;

  try {
    const receipts = await Receipt.find({ mandalId })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate('collectorId', 'name');

    const exportData = receipts.map((r) => ({
      'Receipt No': r.receiptNo,
      'Date': new Date(r.createdAt).toLocaleDateString(),
      'Donor Name': r.donationId?.donorId?.name || 'N/A',
      'Mobile': r.donationId?.donorId?.mobile || 'N/A',
      'Payment Mode': r.paymentMode,
      'Amount (INR)': r.amount,
      'Collector': r.collectorId?.name || 'N/A',
      'Status': r.status,
    }));

    if (format === 'csv') {
      const csvStr = exportToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=receipts_report.csv');
      return res.send(csvStr);
    } else {
      const excelBuf = exportToExcel(exportData, 'Receipts');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=receipts_report.xlsx');
      return res.send(excelBuf);
    }
  } catch (error) {
    console.error('Export receipts error:', error);
    res.status(500).json({ message: 'Server error exporting report' });
  }
};

export const exportExpensesReport = async (req, res) => {
  const mandalId = req.mandalId;
  const { format = 'xlsx' } = req.query;

  try {
    const expenses = await Expense.find({ mandalId }).populate('vendorId', 'name businessName');

    const exportData = expenses.map((e) => ({
      'Expense No': e.expenseNo,
      'Date': new Date(e.date).toLocaleDateString(),
      'Category': e.category,
      'Description': e.description,
      'Amount (INR)': e.amount,
      'Payment Mode': e.paymentMode,
      'Vendor / Shop': e.vendorId?.businessName || e.vendorId?.name || 'N/A',
      'Paid By': e.paidBy,
      'Status': e.status,
      'Notes': e.notes || '',
    }));

    if (format === 'csv') {
      const csvStr = exportToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses_report.csv');
      return res.send(csvStr);
    } else {
      const excelBuf = exportToExcel(exportData, 'Expenses');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses_report.xlsx');
      return res.send(excelBuf);
    }
  } catch (error) {
    console.error('Export expenses error:', error);
    res.status(500).json({ message: 'Server error exporting report' });
  }
};
