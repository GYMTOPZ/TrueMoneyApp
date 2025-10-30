// Tipos de datos principales de la aplicación

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  lastSync: Date;
  apiCredentials?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  isRecurring: boolean;
  merchantName?: string;
  location?: string;
  notes?: string;
}

export type TransactionCategory =
  | 'food'
  | 'transportation'
  | 'entertainment'
  | 'utilities'
  | 'rent'
  | 'healthcare'
  | 'shopping'
  | 'education'
  | 'salary'
  | 'investment'
  | 'other';

export interface Budget {
  id: string;
  category: TransactionCategory;
  monthlyLimit: number;
  dailyLimit: number;
  currentSpent: number;
  alerts: boolean;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  category?: TransactionCategory;
  potentialSavings?: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface SpendingPattern {
  category: TransactionCategory;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  unusualActivity: boolean;
  recurringExpenses: Transaction[];
}

export interface IncomePattern {
  source: string;
  averageMonthly: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  nextExpectedDate?: Date;
  consistency: number; // 0-100
}

export interface DailyBudget {
  date: Date;
  availableToSpend: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}
