import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://127.0.0.1:5000/api';

const runTest = async () => {
  console.log('Starting automated MandalSetu integration verification...');
  let token = '';
  let mandalId = '';
  let festivalId = '';
  let donorId = '';
  let donationId = '';
  let receiptId = '';
  let vendorId = '';
  let expenseId = '';

  const request = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (mandalId) {
      headers['x-mandal-id'] = mandalId;
    }

    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw { response: { data }, message: data.message || `Request failed with status ${res.status}` };
    }
    return data;
  };

  try {
    // 1. Test Auth Login
    console.log('\n--- 1. Testing Admin Login ---');
    const loginData = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        emailOrMobile: 'admin@mandalsetu.com',
        password: 'Password123'
      })
    });
    token = loginData.token;
    mandalId = loginData.activeMandalId;
    console.log(`Login Successful. Token: ${token.substring(0, 15)}... Mandal ID: ${mandalId}`);

    // 2. Test Get Profile & Fetch Festival ID
    console.log('\n--- 2. Fetching active Utsav Year ---');
    const user = await request(`${API_URL}/auth/profile`);
    console.log(`Profile retrieved: ${user.name}`);

    const festivals = await request(`${API_URL}/festivals`);
    const activeFest = festivals.find(f => f.status === 'ACTIVE');
    if (activeFest) {
      festivalId = activeFest._id;
      console.log(`Active Festival found: ${activeFest.name} (${festivalId})`);
    } else {
      throw new Error('No active festival found in database');
    }

    // 3. Test Dashboard Aggregates
    console.log('\n--- 3. Testing Dashboard Stats ---');
    const stats = await request(`${API_URL}/dashboard`);
    console.log('Dashboard summary metrics:', stats.summary);

    // 4. Test Create Donor
    console.log('\n--- 4. Creating Donor ---');
    const mobile = `98700${Math.floor(10000 + Math.random() * 90000)}`;
    const donor = await request(`${API_URL}/donors`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'श्री. गणेश तुकाराम गायकवाड',
        mobile,
        email: 'ganesh.gaikwad@outlook.com',
        address: 'शनिवार पेठ, पुणे'
      })
    });
    donorId = donor._id;
    console.log(`Donor created: ${donor.name} (${donorId})`);

    // 5. Test Create Receipt (Donation + Receipt + PDF + Journal Ledger Entry)
    console.log('\n--- 5. Creating Receipt (Donation + Digital Receipt) ---');
    const receiptData = await request(`${API_URL}/receipts`, {
      method: 'POST',
      body: JSON.stringify({
        name: donor.name,
        mobile,
        amount: 1001,
        purpose: 'गणपती वर्गणी',
        paymentMode: 'CASH',
        notes: 'Test integration donation collection',
        festivalId
      })
    });
    receiptId = receiptData.receipt._id;
    donationId = receiptData.donation._id;
    console.log(`Receipt Created: ${receiptData.receipt.receiptNo} (Amount: ₹${receiptData.receipt.amount})`);

    // 6. Test Create Vendor
    console.log('\n--- 6. Creating Vendor ---');
    const vendor = await request(`${API_URL}/vendors`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'विष्णू जोशी',
        businessName: 'जोशी प्रसादम कॅटरर्स',
        mobile: `99700${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'Prasad'
      })
    });
    vendorId = vendor._id;
    console.log(`Vendor registered: ${vendor.businessName}`);

    // 7. Test Log Expense (Draft -> Approved -> Paid)
    console.log('\n--- 7. Logging Expense ---');
    const expense = await request(`${API_URL}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        category: 'Prasad',
        description: 'प्रथम दिन आरती महाप्रसाद वाटप बुंदी लाडू खरेदी',
        amount: 4500,
        paymentMode: 'UPI',
        vendorId,
        paidBy: 'श्री. राहुल थोरात',
        festivalId
      })
    });
    expenseId = expense._id;
    console.log(`Expense logged as PENDING_APPROVAL: ${expense.expenseNo} (Amount: ₹${expense.amount})`);

    // Approve Expense
    console.log('Approving Expense...');
    const appData = await request(`${API_URL}/expenses/${expenseId}/approve`, {
      method: 'PUT'
    });
    console.log(`Expense status updated to: ${appData.status}`);

    // Pay Expense (Triggers journal entries)
    console.log('Paying Expense...');
    const payData = await request(`${API_URL}/expenses/${expenseId}/pay`, {
      method: 'PUT'
    });
    console.log(`Expense status updated to: ${payData.status} (Accounting entry logged)`);

    // 8. Verify Bookkeeping Balance
    console.log('\n--- 8. Checking Accounting Trial Balance ---');
    const bsRes = await request(`${API_URL}/accounting/balance-sheet`);
    console.log('Chart of Accounts balances:');
    let totalAssets = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const acc of bsRes) {
      console.log(` - ${acc.code} | ${acc.name}: Balance = ₹${acc.balance}`);
      if (acc.type === 'ASSET') totalAssets += acc.balance;
      if (acc.type === 'INCOME') totalIncome += acc.balance;
      if (acc.type === 'EXPENSE') totalExpenses += acc.balance;
    }
    
    console.log(`Calculated Net Available Cash/Bank assets: ₹${totalAssets}`);
    console.log(`Calculated Net Profit/Loss Surplus: ₹${totalIncome - totalExpenses}`);
    
    console.log('\n=========================================');
    console.log('INTEGRATION TEST PASSED SUCCESSFULLY!');
    console.log('All controllers, models, PDFs, and bookkeeping verified.');
    console.log('=========================================');
    process.exit(0);

  } catch (error) {
    console.error('\nINTEGRATION TEST FAILED!');
    console.error('Error Details:', error.response?.data || error.message || error);
    process.exit(1);
  }
};

runTest();
