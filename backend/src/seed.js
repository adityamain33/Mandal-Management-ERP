import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import User from './models/User.js';
import Mandal from './models/Mandal.js';
import Setting from './models/Setting.js';
import Festival from './models/Festival.js';
import Donor from './models/Donor.js';
import Donation from './models/Donation.js';
import Receipt from './models/Receipt.js';
import Vendor from './models/Vendor.js';
import Expense from './models/Expense.js';
import Account from './models/Account.js';
import Transaction from './models/Transaction.js';
import Member from './models/Member.js';
import Volunteer from './models/Volunteer.js';
import VolunteerTask from './models/VolunteerTask.js';
import Event from './models/Event.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Mandal.deleteMany();
    await Setting.deleteMany();
    await Festival.deleteMany();
    await Donor.deleteMany();
    await Donation.deleteMany();
    await Receipt.deleteMany();
    await Vendor.deleteMany();
    await Expense.deleteMany();
    await Account.deleteMany();
    await Transaction.deleteMany();
    await Member.deleteMany();
    await Volunteer.deleteMany();
    await VolunteerTask.deleteMany();
    await Event.deleteMany();

    console.log('Existing database cleared.');

    // 1. Create Mandal
    const mandal = await Mandal.create({
      name: 'श्री गणेश मित्र मंडळ',
      registrationDetails: 'MH-PN/2026/00456',
      address: 'सदाशिव पेठ, शनिवार वाडा जवळ, पुणे',
      city: 'पुणे',
      state: 'महाराष्ट्र',
      configuration: {
        receiptPrefix: 'GM/26',
        receiptStartNumber: 1,
      },
    });
    console.log('Mandal seeded.');

    // 2. Create Users
    const adminUser = await User.create({
      name: 'श्री. राहुल ज्ञानदेव थोरात',
      email: 'admin@mandalsetu.com',
      mobile: '9881001122',
      password: 'Password123',
      activeMandalId: mandal._id,
      mandalRoles: [{ mandalId: mandal._id, role: 'MANDAL_ADMIN' }],
    });

    const treasurerUser = await User.create({
      name: 'श्री. महेश विजय भोसले',
      email: 'treasurer@mandalsetu.com',
      mobile: '9881003344',
      password: 'Password123',
      activeMandalId: mandal._id,
      mandalRoles: [{ mandalId: mandal._id, role: 'TREASURER' }],
    });

    const volunteerMgrUser = await User.create({
      name: 'श्री. अमोल ज्ञानेश्वर शिर्के',
      email: 'volunteer@mandalsetu.com',
      mobile: '9881005566',
      password: 'Password123',
      activeMandalId: mandal._id,
      mandalRoles: [{ mandalId: mandal._id, role: 'VOLUNTEER_MANAGER' }],
    });

    const memberUser = await User.create({
      name: 'श्री. तुषार विठ्ठल जाधव',
      email: 'member@mandalsetu.com',
      mobile: '9881007788',
      password: 'Password123',
      activeMandalId: mandal._id,
      mandalRoles: [{ mandalId: mandal._id, role: 'MEMBER' }],
    });
    console.log('Users seeded (Admin, Treasurer, Volunteer Manager, Member).');

    // 3. Create Settings
    await Setting.create({
      mandalId: mandal._id,
      receiptPrefix: 'GM/26',
      receiptStartNumber: 1,
    });

    // 4. Create Active Festival
    const today = new Date();
    const startDate = new Date('2026-09-14'); // Ganesh Chaturthi 2026 approx
    const endDate = new Date('2026-09-24'); // Anant Chaturdashi 2026 approx
    const festival = await Festival.create({
      name: 'गणेशोत्सव २०२६',
      year: 2026,
      startDate,
      endDate,
      mandalId: mandal._id,
      theme: 'महाराष्ट्र रायगड किल्ला देखावा',
      budget: 200000,
      expectedDonation: 350000,
      status: 'ACTIVE',
    });
    console.log('Festival seeded.');

    // 5. Create Chart of Accounts
    const cashAcc = await Account.create({ code: '1000', name: 'रोख खाते (Cash Account)', type: 'ASSET', mandalId: mandal._id });
    const bankAcc = await Account.create({ code: '1010', name: 'बँक खाते (Bank Account)', type: 'ASSET', mandalId: mandal._id });
    
    const donationIncAcc = await Account.create({ code: '3000', name: 'वर्गणी व देणगी जमा (Donation Revenue)', type: 'INCOME', mandalId: mandal._id });
    
    const decorationExpAcc = await Account.create({ code: '4000', name: 'उत्सव सजावट खर्च (Decoration Expense)', type: 'EXPENSE', mandalId: mandal._id });
    const prasadExpAcc = await Account.create({ code: '4010', name: 'प्रसाद खर्च (Prasad Expense)', type: 'EXPENSE', mandalId: mandal._id });
    const culturalExpAcc = await Account.create({ code: '4020', name: 'सांस्कृतिक कार्यक्रम खर्च (Cultural Expense)', type: 'EXPENSE', mandalId: mandal._id });
    const miscExpAcc = await Account.create({ code: '4030', name: 'इतर खर्च (Miscellaneous Expense)', type: 'EXPENSE', mandalId: mandal._id });
    console.log('Chart of Accounts seeded.');

    // 6. Create Donors
    const donor1 = await Donor.create({ name: 'श्री. महेश भालचंद्र कुळकर्णी', mobile: '9876543210', email: 'mahesh.k@gmail.com', address: 'पर्वती, पुणे', mandalId: mandal._id });
    const donor2 = await Donor.create({ name: 'श्रीमती सुलोचना आनंदराव पाटील', mobile: '9876543211', email: 'sulochana.p@gmail.com', address: 'कोथरूड, पुणे', mandalId: mandal._id });
    const donor3 = await Donor.create({ name: 'मेसर्स राजलक्ष्मी ज्वेलर्स', mobile: '9876543212', email: 'info@rajlaxmijewellers.com', address: 'लक्ष्मी रोड, पुणे', mandalId: mandal._id });
    const donor4 = await Donor.create({ name: 'श्री. संजय विजय कांबळे', mobile: '9876543213', email: 'sanjay.k@hotmail.com', address: 'हडपसर, पुणे', mandalId: mandal._id });
    console.log('Donors seeded.');

    // 7. Seed Donations & Receipts & Accounting Transactions
    const donationsData = [
      { donorId: donor1._id, amount: 5001, purpose: 'गणपती वर्गणी', paymentMode: 'CASH', rNo: 'GM/26/00001', date: new Date('2026-08-01') },
      { donorId: donor2._id, amount: 10000, purpose: 'महाप्रसाद', paymentMode: 'UPI', rNo: 'GM/26/00002', date: new Date('2026-08-05') },
      { donorId: donor3._id, amount: 51000, purpose: 'मुख्य देणगी', paymentMode: 'BANK TRANSFER', rNo: 'GM/26/00003', date: new Date('2026-08-10') },
      { donorId: donor4._id, amount: 1001, purpose: 'सांस्कृतिक कार्यक्रम', paymentMode: 'CASH', rNo: 'GM/26/00004', date: new Date('2026-08-12') },
    ];

    for (const d of donationsData) {
      const donation = await Donation.create({
        donorId: d.donorId,
        amount: d.amount,
        purpose: d.purpose,
        paymentMode: d.paymentMode,
        status: 'PAID',
        collectorId: adminUser._id,
        mandalId: mandal._id,
        festivalId: festival._id,
        createdAt: d.date,
      });

      const receipt = await Receipt.create({
        receiptNo: d.rNo,
        donationId: donation._id,
        amount: donation.amount,
        paymentMode: donation.paymentMode,
        collectorId: adminUser._id,
        mandalId: mandal._id,
        createdAt: d.date,
      });

      // Journal entry
      const dbAcc = d.paymentMode === 'CASH' ? cashAcc : bankAcc;
      await Transaction.create({
        description: `Donation received - Receipt ${d.rNo}`,
        date: d.date,
        entries: [
          { accountId: dbAcc._id, amount: donation.amount, type: 'DEBIT' },
          { accountId: donationIncAcc._id, amount: donation.amount, type: 'CREDIT' },
        ],
        mandalId: mandal._id,
        donationId: donation._id,
        receiptId: receipt._id,
      });
    }
    console.log('Donations & Receipts seeded.');

    // 8. Seed Vendors
    const vendor1 = await Vendor.create({ name: 'रामभाऊ मांडववाले', businessName: 'रामभाऊ पेंडॉल डेकोरेटर्स', mobile: '9922112233', email: 'rambhau.decorations@gmail.com', address: 'सदाशिव पेठ, पुणे', category: 'Decoration', mandalId: mandal._id });
    const vendor2 = await Vendor.create({ name: 'संजय शिंदे', businessName: 'स्वर साधना साऊंड्स', mobile: '9922334455', email: 'swarsadhana.sound@gmail.com', address: 'शनिवार पेठ, पुणे', category: 'Sound System', mandalId: mandal._id });
    console.log('Vendors seeded.');

    // 9. Seed Expenses & Accounting Transactions
    const expense1 = await Expense.create({
      expenseNo: 'EXP/26/00001',
      date: new Date('2026-08-10'),
      category: 'Decoration',
      description: 'मुख्य मंडप व सजावट साहित्याची आगाऊ रक्कम (Advance)',
      amount: 15000,
      paymentMode: 'BANK TRANSFER',
      vendorId: vendor1._id,
      paidBy: 'श्री. राहुल थोरात',
      status: 'PAID',
      approvedBy: treasurerUser._id,
      mandalId: mandal._id,
      festivalId: festival._id,
    });

    await Transaction.create({
      description: `Expense Payment - ADV ${expense1.expenseNo} (${expense1.description})`,
      date: expense1.date,
      entries: [
        { accountId: decorationExpAcc._id, amount: expense1.amount, type: 'DEBIT' },
        { accountId: bankAcc._id, amount: expense1.amount, type: 'CREDIT' },
      ],
      mandalId: mandal._id,
      expenseId: expense1._id,
    });

    const expense2 = await Expense.create({
      expenseNo: 'EXP/26/00002',
      date: new Date('2026-08-14'),
      category: 'Sound System',
      description: 'ध्वनियंत्रणा (Sound System) आगाऊ बुकिंग रक्कम',
      amount: 5000,
      paymentMode: 'CASH',
      vendorId: vendor2._id,
      paidBy: 'श्री. महेश भोसले',
      status: 'APPROVED',
      approvedBy: adminUser._id,
      mandalId: mandal._id,
      festivalId: festival._id,
    });

    const expense3 = await Expense.create({
      expenseNo: 'EXP/26/00003',
      date: new Date('2026-08-15'),
      category: 'Prasad',
      description: 'महाप्रसाद पेढे व लाडू खरेदी (Draft)',
      amount: 2500,
      paymentMode: 'CASH',
      paidBy: 'श्री. राहुल थोरात',
      status: 'DRAFT',
      mandalId: mandal._id,
      festivalId: festival._id,
    });
    console.log('Expenses seeded.');

    // 10. Seed Members
    const member1 = await Member.create({ name: 'श्री. राहुल ज्ञानदेव थोरात', mobile: '9881001122', email: 'rahul.thorat@gmail.com', role: 'President', bloodGroup: 'A+', mandalId: mandal._id, status: 'ACTIVE' });
    const member2 = await Member.create({ name: 'श्री. अमोल ज्ञानेश्वर शिर्के', mobile: '9881005566', email: 'amol.shirke@gmail.com', role: 'Secretary', bloodGroup: 'O+', mandalId: mandal._id, status: 'ACTIVE' });
    const member3 = await Member.create({ name: 'श्री. महेश विजय भोसले', mobile: '9881003344', email: 'mahesh.bhosale@gmail.com', role: 'Treasurer', bloodGroup: 'B+', mandalId: mandal._id, status: 'ACTIVE' });
    const member4 = await Member.create({ name: 'श्री. तुषार विठ्ठल जाधव', mobile: '9881007788', email: 'tushar.jadhav@gmail.com', role: 'Volunteer', bloodGroup: 'AB+', mandalId: mandal._id, status: 'ACTIVE' });
    const member5 = await Member.create({ name: 'श्री. अमोल निवृत्ती पवार', mobile: '9881009900', email: 'amol.pawar@gmail.com', role: 'Volunteer', bloodGroup: 'A+', mandalId: mandal._id, status: 'ACTIVE' });
    console.log('Members seeded.');

    // 11. Seed Volunteers & Tasks
    const vol1 = await Volunteer.create({ memberId: member4._id, skills: ['व्यवस्थापन (Management)', 'सुरक्षा (Security)'], availability: 'उत्सवाचे सर्व १० दिवस उपलब्ध', department: 'Security', hoursWorked: 15, mandalId: mandal._id });
    const vol2 = await Volunteer.create({ memberId: member5._id, skills: ['सजावट (Decoration)', 'सोशल मीडिया (Digital)'], availability: 'संध्याकाळच्या वेळी उपलब्ध', department: 'Decoration', hoursWorked: 8, mandalId: mandal._id });

    await VolunteerTask.create({ title: 'मुख्य प्रवेशद्वार सुरक्षा रक्षक नियोजन', description: 'Chaturthi aarti गर्दी नियंत्रण आणि सुरक्षा नियोजनाचे काम', assignedTo: vol1._id, status: 'IN_PROGRESS', dueDate: startDate, mandalId: mandal._id, festivalId: festival._id });
    await VolunteerTask.create({ title: 'मंडप विद्युत रोषणाई मदत', description: 'रोषणाई पूर्ण करणे व वायर ओढणे', assignedTo: vol2._id, status: 'COMPLETED', dueDate: new Date('2026-09-12'), mandalId: mandal._id, festivalId: festival._id });
    console.log('Volunteers and Tasks seeded.');

    // 12. Seed Events
    await Event.create({ name: 'श्री गणेश मूर्ती स्थापना पूजा व मिरवणूक', date: startDate, startTime: '09:00', endTime: '13:00', location: 'मुख्य मंडप, सदाशिव पेठ', description: 'स्थापना महाआरती व मिरवणूक', budget: 10000, coordinatorId: member1._id, volunteers: [vol1._id], status: 'SCHEDULED', mandalId: mandal._id, festivalId: festival._id });
    await Event.create({ name: 'महाप्रसाद (सार्वजनिक भंडारा)', date: new Date('2026-09-20'), startTime: '12:00', endTime: '18:00', location: 'मंडप शेजारील मैदान', description: 'महाप्रसाद वाटप कार्यक्रम', budget: 50000, coordinatorId: member3._id, volunteers: [vol1._id, vol2._id], status: 'SCHEDULED', mandalId: mandal._id, festivalId: festival._id });
    await Event.create({ name: 'रक्तदान शिबिर (Blood Donation Camp)', date: new Date('2026-09-16'), startTime: '09:00', endTime: '16:00', location: 'स्थानिक वाचनालय सभागृह', description: 'सामाजिक उपक्रम रक्तदान शिबिर', budget: 5000, coordinatorId: member2._id, volunteers: [vol2._id], status: 'SCHEDULED', mandalId: mandal._id, festivalId: festival._id });
    console.log('Events seeded.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
