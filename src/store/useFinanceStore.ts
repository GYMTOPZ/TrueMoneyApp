import { create } from 'zustand';
import {
  BankAccount,
  Transaction,
  Budget,
  FinancialInsight,
  DailyBudget,
  SpendingPattern,
  IncomePattern,
} from '../types';

interface FinanceState {
  // Estado
  accounts: BankAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  insights: FinancialInsight[];
  dailyBudget: DailyBudget | null;
  spendingPatterns: SpendingPattern[];
  incomePatterns: IncomePattern[];
  isLoading: boolean;
  error: string | null;

  // Acciones - Cuentas
  addAccount: (account: BankAccount) => void;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  removeAccount: (id: string) => void;
  syncAccount: (id: string) => Promise<void>;

  // Acciones - Transacciones
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  fetchTransactions: (accountId?: string) => Promise<void>;

  // Acciones - Presupuestos
  setBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;

  // Acciones - Análisis
  generateInsights: () => Promise<void>;
  analyzeSpendingPatterns: () => void;
  analyzeIncomePatterns: () => void;
  calculateDailyBudget: () => void;

  // Utilidades
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Estado inicial
  accounts: [],
  transactions: [],
  budgets: [],
  insights: [],
  dailyBudget: null,
  spendingPatterns: [],
  incomePatterns: [],
  isLoading: false,
  error: null,

  // Implementación de acciones - Cuentas
  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates } : acc
      ),
    })),

  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
      transactions: state.transactions.filter((t) => t.accountId !== id),
    })),

  syncAccount: async (id) => {
    const { setLoading, setError } = get();
    setLoading(true);
    try {
      // TODO: Implementar sincronización con API bancaria
      // Esta función se conectará con el servicio bancario
      console.log(`Syncing account ${id}`);
      setError(null);
    } catch (error) {
      setError('Error al sincronizar cuenta');
    } finally {
      setLoading(false);
    }
  },

  // Implementación de acciones - Transacciones
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  fetchTransactions: async (accountId) => {
    const { setLoading, setError } = get();
    setLoading(true);
    try {
      // TODO: Implementar fetch de transacciones desde API
      console.log(`Fetching transactions for account ${accountId}`);
      setError(null);
    } catch (error) {
      setError('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  },

  // Implementación de acciones - Presupuestos
  setBudget: (budget) =>
    set((state) => ({
      budgets: [...state.budgets.filter((b) => b.id !== budget.id), budget],
    })),

  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  // Implementación de acciones - Análisis
  generateInsights: async () => {
    const { transactions, spendingPatterns, incomePatterns } = get();

    // Aquí se implementará la lógica de análisis inteligente
    // Por ahora, ejemplo básico
    const newInsights: FinancialInsight[] = [];

    // Detectar gastos inusuales
    spendingPatterns.forEach((pattern) => {
      if (pattern.unusualActivity) {
        newInsights.push({
          id: `insight-${Date.now()}-${pattern.category}`,
          type: 'warning',
          title: `Gasto elevado en ${pattern.category}`,
          description: `Has gastado más de lo habitual en ${pattern.category} este mes`,
          category: pattern.category,
          actionable: true,
          priority: 'high',
          createdAt: new Date(),
        });
      }
    });

    set({ insights: newInsights });
  },

  analyzeSpendingPatterns: () => {
    const { transactions } = get();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtrar gastos del último mes
    const recentExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date >= thirtyDaysAgo
    );

    // Agrupar por categoría
    const categoryMap = new Map<string, Transaction[]>();
    recentExpenses.forEach((t) => {
      const existing = categoryMap.get(t.category) || [];
      categoryMap.set(t.category, [...existing, t]);
    });

    // Crear patrones
    const patterns: SpendingPattern[] = Array.from(categoryMap.entries()).map(
      ([category, txs]) => {
        const total = txs.reduce((sum, t) => sum + t.amount, 0);
        const recurring = txs.filter((t) => t.isRecurring);

        return {
          category: category as any,
          averageMonthly: total,
          trend: 'stable', // TODO: Calcular tendencia real
          unusualActivity: total > 1000, // TODO: Calcular basado en histórico
          recurringExpenses: recurring,
        };
      }
    );

    set({ spendingPatterns: patterns });
  },

  analyzeIncomePatterns: () => {
    const { transactions } = get();
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Filtrar ingresos de los últimos 3 meses
    const recentIncome = transactions.filter(
      (t) => t.type === 'income' && t.date >= ninetyDaysAgo
    );

    // Agrupar por fuente (merchantName o descripción)
    const sourceMap = new Map<string, Transaction[]>();
    recentIncome.forEach((t) => {
      const source = t.merchantName || t.description;
      const existing = sourceMap.get(source) || [];
      sourceMap.set(source, [...existing, t]);
    });

    // Crear patrones de ingreso
    const patterns: IncomePattern[] = Array.from(sourceMap.entries()).map(
      ([source, txs]) => {
        const total = txs.reduce((sum, t) => sum + t.amount, 0);
        const average = total / 3; // 3 meses

        return {
          source,
          averageMonthly: average,
          frequency: 'monthly', // TODO: Detectar frecuencia real
          consistency: 85, // TODO: Calcular consistencia real
        };
      }
    );

    set({ incomePatterns: patterns });
  },

  calculateDailyBudget: () => {
    const { transactions, budgets, incomePatterns } = get();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const daysRemaining = daysInMonth - today.getDate() + 1;

    // Calcular ingreso mensual promedio
    const monthlyIncome = incomePatterns.reduce(
      (sum, p) => sum + p.averageMonthly,
      0
    );

    // Calcular gastos del mes actual
    const monthExpenses = transactions
      .filter(
        (t) => t.type === 'expense' && t.date >= startOfMonth && t.date <= today
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular presupuestos totales
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    // Calcular cuánto queda disponible
    const remaining = monthlyIncome - monthExpenses;
    const dailyAvailable = remaining / daysRemaining;

    // Gastos de hoy
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    const todaySpent = transactions
      .filter((t) => t.type === 'expense' && t.date >= todayStart && t.date <= todayEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyBudget: DailyBudget = {
      date: today,
      availableToSpend: dailyAvailable,
      spent: todaySpent,
      remaining: dailyAvailable - todaySpent,
      percentageUsed: (todaySpent / dailyAvailable) * 100,
    };

    set({ dailyBudget });
  },

  // Utilidades
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
