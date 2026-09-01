import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

// Import controllers
import { register, login, forgotPassword, resetPassword, getProfile, updateMandal } from '../controllers/authController.js';
import { getPermissionsConfig, getMandalUsers, updateUserRoleAndPermissions, createOrUpdateMemberLogin } from '../controllers/userController.js';
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
router.put('/auth/mandal', protect, checkPermission('settings:manage'), updateMandal);

// --- Permissions & User Management Routes ---
router.get('/permissions/config', protect, getPermissionsConfig);
router.get('/users', protect, checkPermission('members:permissions', 'settings:manage'), getMandalUsers);
router.put('/users/:id/permissions', protect, checkPermission('members:permissions', 'settings:manage'), updateUserRoleAndPermissions);
router.post('/members/:memberId/login', protect, checkPermission('members:permissions', 'members:manage'), createOrUpdateMemberLogin);

// --- Dashboard Routes ---
router.get('/dashboard', protect, checkPermission('dashboard:view'), getDashboardStats);

// --- Receipts Routes ---
router.get('/receipts', protect, checkPermission('receipts:view'), getReceipts);
router.post('/receipts', protect, checkPermission('receipts:create'), createReceipt);
router.get('/receipts/:id/pdf', protect, checkPermission('receipts:pdf', 'receipts:view'), downloadReceiptPDF);
router.put('/receipts/:id/cancel', protect, checkPermission('receipts:cancel'), cancelReceipt);

// --- Donors Routes ---
router.get('/donors', protect, checkPermission('donors:view'), getDonors);
router.post('/donors', protect, checkPermission('donors:manage'), createDonor);
router.get('/donors/:id', protect, checkPermission('donors:view'), getDonorProfile);
router.put('/donors/:id', protect, checkPermission('donors:manage'), updateDonor);

// --- Donations Routes ---
router.get('/donations', protect, checkPermission('donations:view'), getDonations);
router.post('/donations', protect, checkPermission('donations:create'), createDonation);
router.put('/donations/:id/status', protect, checkPermission('donations:status'), updateDonationStatus);

// --- Expenses Routes ---
router.get('/expenses', protect, checkPermission('expenses:view'), getExpenses);
router.post('/expenses', protect, checkPermission('expenses:create'), createExpense);
router.put('/expenses/:id/approve', protect, checkPermission('expenses:approve'), approveExpense);
router.put('/expenses/:id/reject', protect, checkPermission('expenses:approve'), rejectExpense);
router.put('/expenses/:id/pay', protect, checkPermission('expenses:pay'), payExpense);

// --- Members Routes ---
router.get('/members', protect, checkPermission('members:view'), getMembers);
router.post('/members', protect, checkPermission('members:manage'), createMember);
router.put('/members/:id', protect, checkPermission('members:manage'), updateMember);
router.delete('/members/:id', protect, checkPermission('members:manage'), deleteMember);

// --- Volunteers Routes ---
router.get('/volunteers', protect, checkPermission('volunteers:view'), getVolunteers);
router.post('/volunteers', protect, checkPermission('volunteers:manage'), createVolunteer);
router.get('/volunteers/tasks', protect, checkPermission('volunteers:view'), getVolunteerTasks);
router.post('/volunteers/tasks', protect, checkPermission('volunteers:manage'), createVolunteerTask);
router.put('/volunteers/tasks/:id/status', protect, checkPermission('volunteers:manage', 'volunteers:view'), updateVolunteerTaskStatus);
router.put('/volunteers/:id/hours', protect, checkPermission('volunteers:log_hours', 'volunteers:manage'), logHours);

// --- Festivals Routes ---
router.get('/festivals', protect, getFestivals);
router.post('/festivals', protect, checkPermission('settings:manage'), createFestival);
router.put('/festivals/:id', protect, checkPermission('settings:manage'), updateFestival);

// --- Events Routes ---
router.get('/events', protect, checkPermission('events:view'), getEvents);
router.post('/events', protect, checkPermission('events:manage'), createEvent);
router.put('/events/:id', protect, checkPermission('events:manage'), updateEvent);
router.delete('/events/:id', protect, checkPermission('events:manage'), deleteEvent);

// --- Vendors Routes ---
router.get('/vendors', protect, checkPermission('vendors:view'), getVendors);
router.post('/vendors', protect, checkPermission('vendors:manage'), createVendor);
router.get('/vendors/:id', protect, checkPermission('vendors:view'), getVendorProfile);
router.put('/vendors/:id', protect, checkPermission('vendors:manage'), updateVendor);

// --- Accounting Routes ---
router.get('/accounting/accounts', protect, checkPermission('accounting:view'), getAccounts);
router.get('/accounting/transactions', protect, checkPermission('accounting:view'), getTransactions);
router.post('/accounting/transactions', protect, checkPermission('accounting:create'), createTransaction);
router.get('/accounting/ledger', protect, checkPermission('accounting:view'), getLedger);
router.get('/accounting/cashbook', protect, checkPermission('accounting:view'), getCashBook);
router.get('/accounting/bankbook', protect, checkPermission('accounting:view'), getBankBook);
router.get('/accounting/balance-sheet', protect, checkPermission('accounting:view'), getBalanceSummary);

// --- Reports Routes ---
router.get('/reports/profit-loss', protect, checkPermission('reports:view'), getProfitLossReport);
router.get('/reports/donations/export', protect, checkPermission('reports:export'), exportDonationsReport);
router.get('/reports/receipts/export', protect, checkPermission('reports:export'), exportReceiptsReport);
router.get('/reports/expenses/export', protect, checkPermission('reports:export'), exportExpensesReport);

// --- Audit Log Routes ---
router.get('/audit-logs', protect, checkPermission('audit_logs:view'), getAuditLogs);

// --- Notifications Routes ---
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// --- Settings Routes ---
router.get('/settings', protect, checkPermission('settings:view'), getSettings);
router.put('/settings', protect, checkPermission('settings:manage'), updateSettings);

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

