// Permission Definition & Role Presets for MandalSetu ERP

export const MODULE_PERMISSIONS = [
  {
    module: 'dashboard',
    title: 'डॅशबोर्ड / Dashboard',
    permissions: [
      { id: 'dashboard:view', label: 'डॅशबोर्ड पहा (View Dashboard)' },
      { id: 'dashboard:stats', label: 'आकडेवारी व अहवाल सारांश पहा (View Summary Stats)' },
    ],
  },
  {
    module: 'receipts',
    title: 'पावती पुस्तक / Receipts',
    permissions: [
      { id: 'receipts:view', label: 'पावत्यांची यादी पहा (View Receipts)' },
      { id: 'receipts:create', label: 'नवीन पावती काढा (Create Receipt)' },
      { id: 'receipts:cancel', label: 'पावती रद्द करा (Cancel Receipt)' },
      { id: 'receipts:pdf', label: 'पावती PDF डाऊनलोड / प्रिंट करा (Download/Print PDF)' },
    ],
  },
  {
    module: 'donations',
    title: 'देणगी व वर्गणी / Donations',
    permissions: [
      { id: 'donations:view', label: 'वर्गणी / देणगी नोंदी पहा (View Donations)' },
      { id: 'donations:create', label: 'नवीन देणगी नोंदवा (Add Donation)' },
      { id: 'donations:status', label: 'देणगी स्थिती बदला (Update Status)' },
    ],
  },
  {
    module: 'expenses',
    title: 'खर्च व्यवस्थापन / Expenses',
    permissions: [
      { id: 'expenses:view', label: 'खर्चाची यादी पहा (View Expenses)' },
      { id: 'expenses:create', label: 'नवीन खर्च सादर करा (Submit Expense)' },
      { id: 'expenses:approve', label: 'खर्च मंजूर / नामंजूर करा (Approve/Reject Expense)' },
      { id: 'expenses:pay', label: 'खर्च भरणा नोंदवा (Mark as Paid)' },
    ],
  },
  {
    module: 'accounting',
    title: 'हिशोब व खाती / Accounting & Ledger',
    permissions: [
      { id: 'accounting:view', label: 'खातेवही, रोख वही, बँक वही पहा (View Ledger & Cash Book)' },
      { id: 'accounting:create', label: 'जर्नल व्यवहार नोंदवा (Create Transactions)' },
      { id: 'accounting:manage', label: 'खाते चार्ट व्यवस्थापन (Manage Accounts)' },
    ],
  },
  {
    module: 'members',
    title: 'मंडळ सदस्य / Members',
    permissions: [
      { id: 'members:view', label: 'सदस्य यादी पहा (View Members Directory)' },
      { id: 'members:manage', label: 'सदस्य जोडा, बदला व हटवा (Add/Edit/Delete Members)' },
      { id: 'members:permissions', label: 'सदस्य लॉगिन व परवानग्या व्यवस्थापित करा (Manage Login & Permissions)' },
    ],
  },
  {
    module: 'donors',
    title: 'देणगीदार / Donors',
    permissions: [
      { id: 'donors:view', label: 'देणगीदार यादी पहा (View Donors)' },
      { id: 'donors:manage', label: 'देणगीदार जोडा व बदला (Add/Edit Donors)' },
    ],
  },
  {
    module: 'volunteers',
    title: 'कार्यकर्ते व स्वयंसेवक / Volunteers & Tasks',
    permissions: [
      { id: 'volunteers:view', label: 'स्वयंसेवक व कामे पहा (View Volunteers & Tasks)' },
      { id: 'volunteers:manage', label: 'कामे नियुक्त करा व बदला (Assign/Manage Tasks)' },
      { id: 'volunteers:log_hours', label: 'कामाचे तास नोंदवा (Log Service Hours)' },
    ],
  },
  {
    module: 'events',
    title: 'उत्सव व कार्यक्रम / Events & Calendar',
    permissions: [
      { id: 'events:view', label: 'कार्यक्रम दिनदर्शिका पहा (View Events Schedule)' },
      { id: 'events:manage', label: 'नवीन कार्यक्रम जोडा, बदला व हटवा (Manage Events)' },
    ],
  },
  {
    module: 'vendors',
    title: 'व्यापारी व सेवा पुरवठादार / Vendors',
    permissions: [
      { id: 'vendors:view', label: 'पुरवठादार यादी पहा (View Vendors)' },
      { id: 'vendors:manage', label: 'पुरवठादार जोडा व बदला (Manage Vendors)' },
    ],
  },
  {
    module: 'reports',
    title: 'अहवाल / Reports',
    permissions: [
      { id: 'reports:view', label: 'नफा-तोटा व ताळेबंद अहवाल पहा (View Financial Reports)' },
      { id: 'reports:export', label: 'एक्सेल/PDF एक्सपोर्ट करा (Export Reports)' },
    ],
  },
  {
    module: 'audit_logs',
    title: 'ऑडिट लॉग / Audit Logs',
    permissions: [
      { id: 'audit_logs:view', label: 'सिस्टीम ऑडिट लॉग पहा (View Security & Audit Logs)' },
    ],
  },
  {
    module: 'settings',
    title: 'मंडळ सेटिंग्ज / Settings',
    permissions: [
      { id: 'settings:view', label: 'सेटिंग्ज पहा (View Settings)' },
      { id: 'settings:manage', label: 'मंडळ माहिती व सेटिंग्ज बदला (Update Settings)' },
    ],
  },
];

// All flat permissions list
export const ALL_PERMISSIONS = MODULE_PERMISSIONS.flatMap((m) => m.permissions.map((p) => p.id));

// Role Defaults
export const ROLE_DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  MANDAL_ADMIN: ALL_PERMISSIONS,
  
  TREASURER: [
    'dashboard:view',
    'dashboard:stats',
    'receipts:view',
    'receipts:create',
    'receipts:cancel',
    'receipts:pdf',
    'donations:view',
    'donations:create',
    'donations:status',
    'expenses:view',
    'expenses:create',
    'expenses:approve',
    'expenses:pay',
    'accounting:view',
    'accounting:create',
    'accounting:manage',
    'donors:view',
    'donors:manage',
    'vendors:view',
    'vendors:manage',
    'members:view',
    'volunteers:view',
    'events:view',
    'reports:view',
    'reports:export',
    'audit_logs:view',
    'settings:view',
  ],

  ACCOUNTANT: [
    'dashboard:view',
    'dashboard:stats',
    'receipts:view',
    'receipts:create',
    'receipts:pdf',
    'donations:view',
    'donations:create',
    'expenses:view',
    'expenses:create',
    'accounting:view',
    'accounting:create',
    'donors:view',
    'vendors:view',
    'reports:view',
    'reports:export',
  ],

  VOLUNTEER_MANAGER: [
    'dashboard:view',
    'volunteers:view',
    'volunteers:manage',
    'volunteers:log_hours',
    'events:view',
    'events:manage',
    'members:view',
    'receipts:view',
    'donations:view',
  ],

  RECEIPT_OPERATOR: [
    'dashboard:view',
    'receipts:view',
    'receipts:create',
    'receipts:pdf',
    'donations:view',
    'donations:create',
    'donors:view',
    'donors:manage',
  ],

  EVENT_MANAGER: [
    'dashboard:view',
    'events:view',
    'events:manage',
    'volunteers:view',
    'volunteers:manage',
    'members:view',
  ],

  MEMBER: [
    'dashboard:view',
    'events:view',
    'members:view',
    'volunteers:view',
    'volunteers:log_hours',
    'receipts:view',
    'donations:view',
  ],

  VIEWER: [
    'dashboard:view',
    'events:view',
    'members:view',
  ],
};

/**
 * Compute the effective permissions for a user given their role and any custom permission overrides.
 */
export const computePermissions = (role, customPermissions = []) => {
  if (role === 'SUPER_ADMIN' || role === 'MANDAL_ADMIN') {
    return ALL_PERMISSIONS;
  }
  if (Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions;
  }
  return ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.MEMBER;
};
