export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  balance: number;
  accountType: string;
  rowIndex: number;
  parsedBalance?: number;
}

export interface BankBalanceSummary {
  totalBalance: number;
  totalAccounts: number;
  accountsByType: { [key: string]: number };
  accountsByBank: { [key: string]: number };
}

export interface BankDataResponse {
  data: BankAccount[];
  error: string | null;
  summary: BankBalanceSummary;
}