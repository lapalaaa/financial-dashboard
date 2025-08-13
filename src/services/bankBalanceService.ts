import { BankAccount, BankBalanceSummary, BankDataResponse } from '../types/bankTypes';

export async function fetchAndParseBankData(
  sheetId: string | null, 
  backendApiUrl: string | null
): Promise<BankDataResponse> {
  try {
    if (!sheetId) {
      return { 
        data: [], 
        error: "Google Sheet ID not configured. Please set up your configuration in Settings.",
        summary: { totalBalance: 0, totalAccounts: 0, accountsByType: {}, accountsByBank: {} }
      };
    }

    if (!backendApiUrl) {
      return { 
        data: [], 
        error: "Backend API URL not configured. Please set up your configuration in Settings.",
        summary: { totalBalance: 0, totalAccounts: 0, accountsByType: {}, accountsByBank: {} }
      };
    }

    console.log("Fetching bank balance data from Google Sheets via backend API...");
    
    // Use backend API endpoint to fetch spreadsheet data from Sheet2
    const apiUrl = `${backendApiUrl}/spreadsheet/${sheetId}/data?sheet=Sheet2`;
    console.log("Bank Balance API URL:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Backend API responded with status: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log("Bank Balance API response:", responseData);
    
    if (!responseData.success) {
      throw new Error(responseData.message || responseData.error || "Backend API returned unsuccessful response");
    }

    const rawData = responseData.data;
    console.log("Raw bank data from API:", rawData);
    
    if (!rawData) {
      return { 
        data: [], 
        error: null,
        summary: { totalBalance: 0, totalAccounts: 0, accountsByType: {}, accountsByBank: {} }
      };
    }

    // Handle the actual data format from the API
    if (!Array.isArray(rawData)) {
      throw new Error("Expected array of bank account objects from API");
    }

    console.log("Processing bank data objects:", rawData);

    if (rawData.length === 0) {
      return {
        data: [],
        error: null,
        summary: { totalBalance: 0, totalAccounts: 0, accountsByType: {}, accountsByBank: {} }
      };
    }

    const bankAccounts: BankAccount[] = rawData.map((row: any, index: number) => {
      const account: Partial<BankAccount> & { [key: string]: any } = {
        id: `bank-${index}`,
        rowIndex: row._rowIndex || index + 2
      };

      // Handle the actual data structure from the API (objects with Bank and Amount properties)
      if (row.Bank) {
        const bankFullName = String(row.Bank);
        // Extract account name from bank name (e.g., "Mandiri Wimboro" -> bank: "Mandiri", account: "Wimboro")
        const bankParts = bankFullName.split(' ');
        if (bankParts.length > 1) {
          account.bankName = bankParts[0]; // First word as bank name
          account.accountName = bankParts.slice(1).join(' '); // Everything after first word
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
      
      // Set default account type based on bank name
      account.accountType = 'Tabungan'; // Default to savings account
      
      // Store additional fields
      Object.keys(row).forEach(key => {
        if (key !== 'Bank' && key !== 'Amount' && key !== '_rowIndex') {
          account[key] = row[key];
        }
      });

      // Set defaults for missing fields
      if (!account.accountName) account.accountName = 'Unknown Account';
      if (!account.bankName) account.bankName = 'Unknown Bank';
      if (account.balance === undefined) account.balance = 0;
      if (account.parsedBalance === undefined) account.parsedBalance = 0;
      if (!account.accountType) account.accountType = 'Unknown';
      
      return account as BankAccount;
    }).filter((account: BankAccount) => account.accountName !== 'Unknown Account' || account.balance > 0); // Only include valid accounts

    // Calculate summary
    const summary: BankBalanceSummary = {
      totalBalance: bankAccounts.reduce((sum, account) => sum + account.balance, 0),
      totalAccounts: bankAccounts.length,
      accountsByType: {},
      accountsByBank: {}
    };

    // Group by account type
    bankAccounts.forEach(account => {
      if (!summary.accountsByType[account.accountType]) {
        summary.accountsByType[account.accountType] = 0;
      }
      summary.accountsByType[account.accountType] += account.balance;
    });

    // Group by bank
    bankAccounts.forEach(account => {
      if (!summary.accountsByBank[account.bankName]) {
        summary.accountsByBank[account.bankName] = 0;
      }
      summary.accountsByBank[account.bankName] += account.balance;
    });

    console.log("Final processed bank accounts:", bankAccounts);
    console.log("Bank balance summary:", summary);
    
    return { data: bankAccounts, error: null, summary };
  } catch (error) {
    console.error("Error fetching or parsing bank balance data via backend:", error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : "Unknown error fetching bank balance data.",
      summary: { totalBalance: 0, totalAccounts: 0, accountsByType: {}, accountsByBank: {} }
    };
  }
}