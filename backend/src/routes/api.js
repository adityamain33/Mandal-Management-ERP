import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

// Import controllers
import { register, login, forgotPassword, resetPassword, getProfile, updateMandal } from '../controllers/authController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { getReceipts, createReceipt, downloadReceiptPDF, cancelReceipt } from '../controllers/receiptController.js';
import { getDonors, createDonor, getDonorProfile, updateDonor } from '../controllers/donorController.js';
import { getDonations, createDonation, updateDonationStatus } from '../controllers/donationController.js';
import { getExpenses, createExpense, approveExpense, rejectExpense, payExpense } from '../controllers/expenseController.js';
import { getMembers, createMember, updateMember, deleteMember } from '../controllers/memberController.js';
import { getVolunteers, createVolunteer, getVolunteerTasks, createVolunteerTask, updateVolunteerTaskStatus, logHours } from '../controllers/volunteerController.js';
import { getFestivals, createFestival, updateFestival } from '../controllers/festivalController.js';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { getVendors, createVendor, getVendorProfile, updateVendor } from '../controllers/vendorController.js';
import { getAccounts, getTransactions, createTransaction, getLedger, getCashBook, getBankBook, getBalanceSummary } from '../controllers/accountingController.js';
import { getProfitLossReport, exportDonationsReport, exportReceiptsReport, exportExpensesReport } from '../controllers/reportController.js';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { getMandalInsights } from '../services/aiService.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/profile', protect, getProfile);
router.put('/auth/mandal', protect, authorize('MANDAL_ADMIN'), updateMandal);

// --- Dashboard Routes ---
router.get('/dashboard', protect, getDashboardStats);

// --- Receipts Routes ---
router.get('/receipts', protect, getReceipts);
router.post('/receipts', protect, authorize('MANDAL_ADMIN', 'TREASURER', 'RECEIPT_OPERATOR'), createReceipt);
router.get('/receipts/:id/pdf', protect, downloadReceiptPDF);
router.put('/receipts/:id/cancel', protect, authorize('MANDAL_ADMIN', 'TREASURER'), cancelReceipt);

// --- Donors Routes ---
router.get('/donors', protect, getDonors);
router.post('/donors', protect, createDonor);
router.get('/donors/:id', protect, getDonorProfile);
router.put('/donors/:id', protect, updateDonor);

// --- Donations Routes ---
router.get('/donations', protect, getDonations);
router.post('/donations', protect, createDonation);
router.put('/donations/:id/status', protect, updateDonationStatus);

// --- Expenses Routes ---
router.get('/expenses', protect, getExpenses);
router.post('/expenses', protect, createExpense);
router.put('/expenses/:id/approve', protect, authorize('MANDAL_ADMIN', 'TREASURER'), approveExpense);
router.put('/expenses/:id/reject', protect, authorize('MANDAL_ADMIN', 'TREASURER'), rejectExpense);
router.put('/expenses/:id/pay', protect, authorize('MANDAL_ADMIN', 'TREASURER'), payExpense);

// --- Members Routes ---
router.get('/members', protect, getMembers);
router.post('/members', protect, createMember);
router.put('/members/:id', protect, updateMember);
router.delete('/members/:id', protect, deleteMember);

// --- Volunteers Routes ---
router.get('/volunteers', protect, getVolunteers);
router.post('/volunteers', protect, createVolunteer);
router.get('/volunteers/tasks', protect, getVolunteerTasks);
router.post('/volunteers/tasks', protect, createVolunteerTask);
router.put('/volunteers/tasks/:id/status', protect, updateVolunteerTaskStatus);
router.put('/volunteers/:id/hours', protect, logHours);

// --- Festivals Routes ---
router.get('/festivals', protect, getFestivals);
router.post('/festivals', protect, createFestival);
router.put('/festivals/:id', protect, updateFestival);

// --- Events Routes ---
router.get('/events', protect, getEvents);
router.post('/events', protect, createEvent);
router.put('/events/:id', protect, updateEvent);
router.delete('/events/:id', protect, deleteEvent);

// --- Vendors Routes ---
router.get('/vendors', protect, getVendors);
router.post('/vendors', protect, createVendor);
router.get('/vendors/:id', protect, getVendorProfile);
router.put('/vendors/:id', protect, updateVendor);

// --- Accounting Routes ---
router.get('/accounting/accounts', protect, getAccounts);
router.get('/accounting/transactions', protect, getTransactions);
router.post('/accounting/transactions', protect, authorize('MANDAL_ADMIN', 'TREASURER', 'ACCOUNTANT'), createTransaction);
router.get('/accounting/ledger', protect, getLedger);
router.get('/accounting/cashbook', protect, getCashBook);
router.get('/accounting/bankbook', protect, getBankBook);
router.get('/accounting/balance-sheet', protect, getBalanceSummary);

// --- Reports Routes ---
router.get('/reports/profit-loss', protect, getProfitLossReport);
router.get('/reports/donations/export', protect, exportDonationsReport);
router.get('/reports/receipts/export', protect, exportReceiptsReport);
router.get('/reports/expenses/export', protect, exportExpensesReport);

// --- Audit Log Routes ---
router.get('/audit-logs', protect, authorize('MANDAL_ADMIN', 'TREASURER'), getAuditLogs);

// --- Notifications Routes ---
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// --- Settings Routes ---
router.get('/settings', protect, getSettings);
router.put('/settings', protect, authorize('MANDAL_ADMIN'), updateSettings);

// --- AI Assistant Route ---
router.post('/ai/ask', protect, async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'Question is required' });
  }
  try {
    const answer = await getMandalInsights(question, req.mandalId);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing AI question' });
  }
});

export default router;
