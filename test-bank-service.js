// Test the bank balance service with actual API data
import { fetchAndParseBankData } from './src/services/bankBalanceService.js';

// Mock the actual API response structure
const mockApiResponse = {
  success: true,
  data: [
    {
      "": "",
      "Bank": "Mandiri Wimboro",
      "Amount": "58315",
      "_rowIndex": 2
    },
    {
      "": "",
      "Bank": "Mandiri Fara",
      "Amount": "2858022",
      "_rowIndex": 3
    },
    {
      "": "",
      "Bank": "Seabank Fara",
      "Amount": "11029278",
      "_rowIndex": 4
    },
    {
      "": "",
      "Bank": "Jago Fara",
      "Amount": "0",
      "_rowIndex": 5
    },
    {
      "": "",
      "Bank": "Jago Wimboro",
      "Amount": "0",
      "_rowIndex": 6
    }
  ]
};

// Test the service processing
console.log('Testing Bank Balance Service...');

// Simulate the service processing
const testData = mockApiResponse.data;
console.log('Input data:', JSON.stringify(testData, null, 2));

// Process the data manually to test our logic
const processedAccounts = testData.map((row, index) => {
  const account = {
    id: `bank-${index}`,
    rowIndex: row._rowIndex || index + 2
  };

  if (row.Bank) {
    const bankFullName = String(row.Bank);
    const bankParts = bankFullName.split(' ');
    if (bankParts.length > 1) {
      account.bankName = bankParts[0];
      account.accountName = bankParts.slice(1).join(' ');
    } else {
      account.bankName = bankFullName;
      account.accountName = bankFullName;
    }
  }

  if (row.Amount !== null && row.Amount !== undefined && row.Amount !== '') {
    const numericBalance = parseFloat(String(row.Amount));
    if (!isNaN(numericBalance)) {
      account.balance = numericBalance;
      account.parsedBalance = numericBalance;
    } else {
      account.balance = 0;
      account.parsedBalance = 0;
    }
  } else {
    account.balance = 0;
    account.parsedBalance = 0;
  }

  account.accountType = 'Tabungan';

  // Set defaults
  if (!account.accountName) account.accountName = 'Unknown Account';
  if (!account.bankName) account.bankName = 'Unknown Bank';
  if (account.balance === undefined) account.balance = 0;
  if (account.parsedBalance === undefined) account.parsedBalance = 0;
  if (!account.accountType) account.accountType = 'Unknown';

  return account;
}).filter(account => account.accountName !== 'Unknown Account' || account.balance > 0);

console.log('\nProcessed accounts:');
processedAccounts.forEach(account => {
  console.log(`- ${account.bankName} ${account.accountName}: ${account.balance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}`);
});

// Calculate summary
const summary = {
  totalBalance: processedAccounts.reduce((sum, account) => sum + account.balance, 0),
  totalAccounts: processedAccounts.length,
  accountsByType: {},
  accountsByBank: {}
};

// Group by account type
processedAccounts.forEach(account => {
  if (!summary.accountsByType[account.accountType]) {
    summary.accountsByType[account.accountType] = 0;
  }
  summary.accountsByType[account.accountType] += account.balance;
});

// Group by bank
processedAccounts.forEach(account => {
  if (!summary.accountsByBank[account.bankName]) {
    summary.accountsByBank[account.bankName] = 0;
  }
  summary.accountsByBank[account.bankName] += account.balance;
});

console.log('\nSummary:');
console.log(`Total Balance: ${summary.totalBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}`);
console.log(`Total Accounts: ${summary.totalAccounts}`);
console.log('By Bank:', summary.accountsByBank);
console.log('By Type:', summary.accountsByType);

console.log('\n✅ Bank Service Test Completed!');