import dotenv from 'dotenv';
import connectDB from './config/db.js';
import {
  sequelize,
  User,
  Mandal,
  Setting,
  Festival,
  Donor,
  Donation,
  Receipt,
  Vendor,
  Expense,
  Account,
  Transaction,
  Member,
  Volunteer,
  VolunteerTask,
  Event,
} from './models/index.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database and sync tables
    await connectDB();
    console.log('MySQL connected for seeding...');

    // Clear existing data in reverse order of dependencies
    await Transaction.destroy({ where: {}, truncate: false });
    await Receipt.destroy({ where: {}, truncate: false });
    await Donation.destroy({ where: {}, truncate: false });
    await Expense.destroy({ where: {}, truncate: false });
    await VolunteerTask.destroy({ where: {}, truncate: false });
    await Event.destroy({ where: {}, truncate: false });
    await Volunteer.destroy({ where: {}, truncate: false });
    await Account.destroy({ where: {}, truncate: false });
    await Donor.destroy({ where: {}, truncate: false });
    await Vendor.destroy({ where: {}, truncate: false });
    await Setting.destroy({ where: {}, truncate: false });
    await Festival.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });
    await Member.destroy({ where: {}, truncate: false });
    await Mandal.destroy({ where: {}, truncate: false });

    console.log('Existing MySQL tables cleared.');

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
    console.log('Mandal seeded (ID:', mandal.id, ')');

    // 2. Create Users
    const adminUser = await User.create({
      name: 'श्री. राहुल ज्ञानदेव थोरात',
      email: 'admin@mandalsetu.com',
      mobile: '9881001122',
      password: 'Password123',
      activeMandalId: mandal.id,
      mandalRoles: [{ mandalId: mandal.id, role: 'MANDAL_ADMIN' }],
    });

    const treasurerUser = await User.create({
      name: 'श्री. महेश विजय भोसले',
      email: 'treasurer@mandalsetu.com',
      mobile: '9881003344',
      password: 'Password123',
      activeMandalId: mandal.id,
      mandalRoles: [{ mandalId: mandal.id, role: 'TREASURER' }],
    });

    const volunteerMgrUser = await User.create({
      name: 'श्री. अमोल ज्ञानेश्वर शिर्के',
      email: 'volunteer@mandalsetu.com',
      mobile: '9881005566',
      password: 'Password123',
      activeMandalId: mandal.id,
      mandalRoles: [{ mandalId: mandal.id, role: 'VOLUNTEER_MANAGER' }],
    });

    const memberUser = await User.create({
      name: 'श्री. तुषार विठ्ठल जाधव',
      email: 'member@mandalsetu.com',
      mobile: '9881007788',
      password: 'Password123',
      activeMandalId: mandal.id,
      mandalRoles: [{ mandalId: mandal.id, role: 'MEMBER' }],
    });
    console.log('Users seeded (Admin, Treasurer, Volunteer Manager, Member).');

    // 3. Create Settings
    await Setting.create({
      mandalId: mandal.id,
      receiptPrefix: 'GM/26',
      receiptStartNumber: 1,
    });

    // 4. Create Active Festival
    const startDate = new Date('2026-09-14');
    const endDate = new Date('2026-09-24');
    const festival = await Festival.create({
      name: 'गणेशोत्सव २०२६',
      year: 2026,
      startDate,
      endDate,
      mandalId: mandal.id,
      theme: 'महाराष्ट्र रायगड किल्ला देखावा',
      budget: 200000,
      expectedDonation: 350000,
      status: 'ACTIVE',
    });
    console.log('Festival seeded.');

    // 5. Create Chart of Accounts
    const cashAcc = await Account.create({ code: '1000', name: 'रोख खाते (Cash Account)', type: 'ASSET', mandalId: mandal.id });
    const bankAcc = await Account.create({ code: '1010', name: 'बँक खाते (Bank Account)', type: 'ASSET', mandalId: mandal.id });
    
    const donationIncAcc = await Account.create({ code: '3000', name: 'वर्गणी व देणगी जमा (Donation Revenue)', type: 'INCOME', mandalId: mandal.id });
    
    const decorationExpAcc = await Account.create({ code: '4000', name: 'उत्सव सजावट खर्च (Decoration Expense)', type: 'EXPENSE', mandalId: mandal.id });
    const prasadExpAcc = await Account.create({ code: '4010', name: 'प्रसाद खर्च (Prasad Expense)', type: 'EXPENSE', mandalId: mandal.id });
    const culturalExpAcc = await Account.create({ code: '4020', name: 'सांस्कृतिक कार्यक्रम खर्च (Cultural Expense)', type: 'EXPENSE', mandalId: mandal.id });
    const miscExpAcc = await Account.create({ code: '4030', name: 'इतर खर्च (Miscellaneous Expense)', type: 'EXPENSE', mandalId: mandal.id });
    console.log('Chart of Accounts seeded.');

    // 6. Create Donors
    const donor1 = await Donor.create({ name: 'श्री. महेश भालचंद्र कुळकर्णी', mobile: '9876543210', email: 'mahesh.k@gmail.com', address: 'पर्वती, पुणे', mandalId: mandal.id });
    const donor2 = await Donor.create({ name: 'श्रीमती सुलोचना आनंदराव पाटील', mobile: '9876543211', email: 'sulochana.p@gmail.com', address: 'कोथरूड, पुणे', mandalId: mandal.id });
    const donor3 = await Donor.create({ name: 'मेसर्स राजलक्ष्मी ज्वेलर्स', mobile: '9876543212', email: 'info@rajlaxmijewellers.com', address: 'लक्ष्मी रोड, पुणे', mandalId: mandal.id });
    const donor4 = await Donor.create({ name: 'श्री. संजय विजय कांबळे', mobile: '9876543213', email: 'sanjay.k@hotmail.com', address: 'हडपसर, पुणे', mandalId: mandal.id });
    console.log('Donors seeded.');

    // 7. Seed Donations & Receipts & Accounting Transactions
    const donationsData = [
      { donorId: donor1.id, amount: 5001, purpose: 'गणपती वर्गणी', paymentMode: 'CASH', rNo: 'GM/26/00001', date: new Date('2026-08-01') },
      { donorId: donor2.id, amount: 10000, purpose: 'महाप्रसाद', paymentMode: 'UPI', rNo: 'GM/26/00002', date: new Date('2026-08-05') },
      { donorId: donor3.id, amount: 51000, purpose: 'मुख्य देणगी', paymentMode: 'BANK TRANSFER', rNo: 'GM/26/00003', date: new Date('2026-08-10') },
      { donorId: donor4.id, amount: 1001, purpose: 'सांस्कृतिक कार्यक्रम', paymentMode: 'CASH', rNo: 'GM/26/00004', date: new Date('2026-08-12') },
    ];

    for (const d of donationsData) {
      const donation = await Donation.create({
        donorId: d.donorId,
        amount: d.amount,
        purpose: d.purpose,
        paymentMode: d.paymentMode,
        status: 'PAID',
        collectorId: adminUser.id,
        mandalId: mandal.id,
        festivalId: festival.id,
        createdAt: d.date,
      });

      const receipt = await Receipt.create({
        receiptNo: d.rNo,
        donationId: donation.id,
        amount: donation.amount,
        paymentMode: donation.paymentMode,
        collectorId: adminUser.id,
        mandalId: mandal.id,
        createdAt: d.date,
      });

      // Journal entry
      const dbAcc = d.paymentMode === 'CASH' ? cashAcc : bankAcc;
      await Transaction.create({
        description: `Donation received - Receipt ${d.rNo}`,
        date: d.date,
        entries: [
          { accountId: dbAcc.id, amount: donation.amount, type: 'DEBIT' },
          { accountId: donationIncAcc.id, amount: donation.amount, type: 'CREDIT' },
        ],
        mandalId: mandal.id,
        donationId: donation.id,
        receiptId: receipt.id,
      });
    }
    console.log('Donations & Receipts seeded.');

    // 8. Seed Vendors
    const vendor1 = await Vendor.create({ name: 'रामभाऊ मांडववाले', businessName: 'रामभाऊ पेंडॉल डेकोरेटर्स', mobile: '9922112233', email: 'rambhau.decorations@gmail.com', address: 'सदाशिव पेठ, पुणे', category: 'Decoration', mandalId: mandal.id });
    const vendor2 = await Vendor.create({ name: 'संजय शिंदे', businessName: 'स्वर साधना साऊंड्स', mobile: '9922334455', email: 'swarsadhana.sound@gmail.com', address: 'शनिवार पेठ, पुणे', category: 'Sound System', mandalId: mandal.id });
    console.log('Vendors seeded.');

    // 9. Seed Expenses & Accounting Transactions
    const expense1 = await Expense.create({
      expenseNo: 'EXP/26/00001',
      date: new Date('2026-08-10'),
      category: 'Decoration',
      description: 'मुख्य मंडप व सजावट साहित्याची आगाऊ रक्कम (Advance)',
      amount: 15000,
      paymentMode: 'BANK TRANSFER',
      vendorId: vendor1.id,
      paidBy: 'श्री. राहुल थोरात',
      status: 'PAID',
      approvedBy: treasurerUser.id,
      mandalId: mandal.id,
      festivalId: festival.id,
    });

    await Transaction.create({
      description: `Expense Payment - ADV ${expense1.expenseNo} (${expense1.description})`,
      date: expense1.date,
      entries: [
        { accountId: decorationExpAcc.id, amount: expense1.amount, type: 'DEBIT' },
        { accountId: bankAcc.id, amount: expense1.amount, type: 'CREDIT' },
      ],
      mandalId: mandal.id,
      expenseId: expense1.id,
    });

    const expense2 = await Expense.create({
      expenseNo: 'EXP/26/00002',
      date: new Date('2026-08-14'),
      category: 'Sound System',
      description: 'ध्वनियंत्रणा (Sound System) आगाऊ बुकिंग रक्कम',
      amount: 5000,
      paymentMode: 'CASH',
      vendorId: vendor2.id,
      paidBy: 'श्री. महेश भोसले',
      status: 'APPROVED',
      approvedBy: adminUser.id,
      mandalId: mandal.id,
      festivalId: festival.id,
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
      mandalId: mandal.id,
      festivalId: festival.id,
    });
    console.log('Expenses seeded.');

    // 10. Seed Members
    const member1 = await Member.create({ name: 'श्री. राहुल ज्ञानदेव थोरात', mobile: '9881001122', email: 'rahul.thorat@gmail.com', role: 'President', bloodGroup: 'A+', mandalId: mandal.id, status: 'ACTIVE' });
    const member2 = await Member.create({ name: 'श्री. अमोल ज्ञानेश्वर शिर्के', mobile: '9881005566', email: 'amol.shirke@gmail.com', role: 'Secretary', bloodGroup: 'O+', mandalId: mandal.id, status: 'ACTIVE' });
    const member3 = await Member.create({ name: 'श्री. महेश विजय भोसले', mobile: '9881003344', email: 'mahesh.bhosale@gmail.com', role: 'Treasurer', bloodGroup: 'B+', mandalId: mandal.id, status: 'ACTIVE' });
    const member4 = await Member.create({ name: 'श्री. तुषार विठ्ठल जाधव', mobile: '9881007788', email: 'tushar.jadhav@gmail.com', role: 'Volunteer', bloodGroup: 'AB+', mandalId: mandal.id, status: 'ACTIVE' });
    const member5 = await Member.create({ name: 'श्री. अमोल निवृत्ती पवार', mobile: '9881009900', email: 'amol.pawar@gmail.com', role: 'Volunteer', bloodGroup: 'A+', mandalId: mandal.id, status: 'ACTIVE' });
    console.log('Members seeded.');

    // 11. Seed Volunteers & Tasks
    const vol1 = await Volunteer.create({ memberId: member4.id, skills: ['व्यवस्थापन (Management)', 'सुरक्षा (Security)'], availability: 'उत्सवाचे सर्व १० दिवस उपलब्ध', department: 'Security', hoursWorked: 15, mandalId: mandal.id });
    const vol2 = await Volunteer.create({ memberId: member5.id, skills: ['सजावट (Decoration)', 'सोशल मीडिया (Digital)'], availability: 'संध्याकाळच्या वेळी उपलब्ध', department: 'Decoration', hoursWorked: 8, mandalId: mandal.id });

    await VolunteerTask.create({ title: 'मुख्य प्रवेशद्वार सुरक्षा रक्षक नियोजन', description: 'Chaturthi aarti गर्दी नियंत्रण आणि सुरक्षा नियोजनाचे काम', assignedTo: vol1.id, status: 'IN_PROGRESS', dueDate: startDate, mandalId: mandal.id, festivalId: festival.id });
    await VolunteerTask.create({ title: 'मंडप विद्युत रोषणाई मदत', description: 'रोषणाई पूर्ण करणे व वायर ओढणे', assignedTo: vol2.id, status: 'COMPLETED', dueDate: new Date('2026-09-12'), mandalId: mandal.id, festivalId: festival.id });
    console.log('Volunteers and Tasks seeded.');

    // 12. Seed Events
    await Event.create({ name: 'श्री गणेश मूर्ती स्थापना पूजा व मिरवणूक', date: startDate, startTime: '09:00', endTime: '13:00', location: 'मुख्य मंडप, सदाशिव पेठ', description: 'स्थापना महाआरती व मिरवणूक', budget: 10000, coordinatorId: member1.id, volunteers: [vol1.id], status: 'SCHEDULED', mandalId: mandal.id, festivalId: festival.id });
    await Event.create({ name: 'महाप्रसाद (सार्वजनिक भंडारा)', date: new Date('2026-09-20'), startTime: '12:00', endTime: '18:00', location: 'मंडप शेजारील मैदान', description: 'महाप्रसाद वाटप कार्यक्रम', budget: 50000, coordinatorId: member3.id, volunteers: [vol1.id, vol2.id], status: 'SCHEDULED', mandalId: mandal.id, festivalId: festival.id });
    await Event.create({ name: 'रक्तदान शिबिर (Blood Donation Camp)', date: new Date('2026-09-16'), startTime: '09:00', endTime: '16:00', location: 'स्थानिक वाचनालय सभागृह', description: 'सामाजिक उपक्रम रक्तदान शिबिर', budget: 5000, coordinatorId: member2.id, volunteers: [vol2.id], status: 'SCHEDULED', mandalId: mandal.id, festivalId: festival.id });
    console.log('Events seeded.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
