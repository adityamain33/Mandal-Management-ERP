import { sequelize } from '../config/db.js';
import Mandal from './Mandal.js';
import User from './User.js';
import Member from './Member.js';
import Donor from './Donor.js';
import Festival from './Festival.js';
import Donation from './Donation.js';
import Receipt from './Receipt.js';
import Vendor from './Vendor.js';
import Expense from './Expense.js';
import Volunteer from './Volunteer.js';
import VolunteerTask from './VolunteerTask.js';
import Event from './Event.js';
import Account from './Account.js';
import Transaction from './Transaction.js';
import AuditLog from './AuditLog.js';
import Notification from './Notification.js';
import Setting from './Setting.js';
import Aarti from './Aarti.js';

export const initAssociations = () => {
  // Mandal associations
  Mandal.hasMany(Aarti, { foreignKey: 'mandalId', as: 'aartis' });
  Aarti.belongsTo(Mandal, { foreignKey: 'mandalId', as: 'mandal' });
  Aarti.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploader' });
  Mandal.hasMany(User, { foreignKey: 'activeMandalId', as: 'users' });
  User.belongsTo(Mandal, { foreignKey: 'activeMandalId', as: 'activeMandal' });

  Mandal.hasMany(Member, { foreignKey: 'mandalId', as: 'members' });
  Member.belongsTo(Mandal, { foreignKey: 'mandalId', as: 'mandal' });

  Mandal.hasMany(Donor, { foreignKey: 'mandalId', as: 'donors' });
  Donor.belongsTo(Mandal, { foreignKey: 'mandalId', as: 'mandal' });

  Mandal.hasMany(Festival, { foreignKey: 'mandalId', as: 'festivals' });
  Festival.belongsTo(Mandal, { foreignKey: 'mandalId', as: 'mandal' });

  Mandal.hasOne(Setting, { foreignKey: 'mandalId', as: 'setting' });
  Setting.belongsTo(Mandal, { foreignKey: 'mandalId', as: 'mandal' });

  // User <-> Member
  Member.hasOne(User, { foreignKey: 'memberId', as: 'userAccount' });
  User.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  // Donor <-> Donation
  Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
  Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

  // Donation <-> Collector (User)
  User.hasMany(Donation, { foreignKey: 'collectorId', as: 'collectedDonations' });
  Donation.belongsTo(User, { foreignKey: 'collectorId', as: 'collector' });

  // Donation <-> Festival
  Festival.hasMany(Donation, { foreignKey: 'festivalId', as: 'donations' });
  Donation.belongsTo(Festival, { foreignKey: 'festivalId', as: 'festival' });

  // Receipt <-> Donation
  Donation.hasOne(Receipt, { foreignKey: 'donationId', as: 'receipt' });
  Receipt.belongsTo(Donation, { foreignKey: 'donationId', as: 'donation' });

  // Receipt <-> Collector (User)
  User.hasMany(Receipt, { foreignKey: 'collectorId', as: 'collectedReceipts' });
  Receipt.belongsTo(User, { foreignKey: 'collectorId', as: 'collector' });

  // Vendor <-> Expense
  Vendor.hasMany(Expense, { foreignKey: 'vendorId', as: 'expenses' });
  Expense.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

  // Expense <-> Approver (User)
  User.hasMany(Expense, { foreignKey: 'approvedBy', as: 'approvedExpenses' });
  Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

  // Expense <-> Festival
  Festival.hasMany(Expense, { foreignKey: 'festivalId', as: 'expenses' });
  Expense.belongsTo(Festival, { foreignKey: 'festivalId', as: 'festival' });

  // Volunteer <-> Member
  Member.hasOne(Volunteer, { foreignKey: 'memberId', as: 'volunteerProfile' });
  Volunteer.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  // VolunteerTask <-> Volunteer
  Volunteer.hasMany(VolunteerTask, { foreignKey: 'assignedTo', as: 'tasks' });
  VolunteerTask.belongsTo(Volunteer, { foreignKey: 'assignedTo', as: 'volunteer' });

  // VolunteerTask <-> Festival
  Festival.hasMany(VolunteerTask, { foreignKey: 'festivalId', as: 'volunteerTasks' });
  VolunteerTask.belongsTo(Festival, { festivalId: 'festivalId', as: 'festival' });

  // Event <-> Coordinator (Member)
  Member.hasMany(Event, { foreignKey: 'coordinatorId', as: 'coordinatedEvents' });
  Event.belongsTo(Member, { foreignKey: 'coordinatorId', as: 'coordinator' });

  // Event <-> Festival
  Festival.hasMany(Event, { foreignKey: 'festivalId', as: 'events' });
  Event.belongsTo(Festival, { foreignKey: 'festivalId', as: 'festival' });

  // AuditLog <-> User
  User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
  AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

export {
  sequelize,
  Mandal,
  User,
  Member,
  Donor,
  Festival,
  Donation,
  Receipt,
  Vendor,
  Expense,
  Volunteer,
  VolunteerTask,
  Event,
  Account,
  Transaction,
  AuditLog,
  Notification,
  Setting,
  Aarti,
};
