import { Transaction, FinancialInsight, TransactionCategory, SpendingPattern, IncomePattern } from '../types';
import { startOfMonth, endOfMonth, subMonths, differenceInDays, format } from 'date-fns';

/**
 * Servicio de Inteligencia Financiera
 *
 * Analiza patrones de gastos e ingresos para generar sugerencias inteligentes
 * que ayuden al usuario a:
 * 1. Reducir gastos innecesarios
 * 2. Maximizar ingresos
 * 3. Optimizar presupuesto diario/mensual
 */

class IntelligenceService {
  /**
   * Genera todas las insights basadas en las transacciones
   */
  generateInsights(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];

    // Análisis de gastos
    insights.push(...this.detectUnnecessaryExpenses(transactions));
    insights.push(...this.detectRecurringExpenses(transactions));
    insights.push(...this.detectUnusualSpending(transactions));
    insights.push(...this.suggestBudgetOptimizations(transactions));

    // Análisis de ingresos
    insights.push(...this.analyzeIncomeOpportunities(transactions));
    insights.push(...this.detectIncomePatterns(transactions));

    // Ordenar por prioridad
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Detecta gastos potencialmente innecesarios
   */
  private detectUnnecessaryExpenses(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const lastMonth = subMonths(now, 1);

    // Categorías que suelen tener gastos innecesarios
    const targetCategories: TransactionCategory[] = [
      'entertainment',
      'shopping',
      'food',
    ];

    targetCategories.forEach((category) => {
      const categoryExpenses = transactions.filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          t.date >= lastMonth
      );

      if (categoryExpenses.length === 0) return;

      const total = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
      const average = total / categoryExpenses.length;

      // Detectar transacciones pequeñas frecuentes (cafés, snacks, etc.)
      if (category === 'food') {
        const smallTransactions = categoryExpenses.filter((t) => t.amount < 15);
        if (smallTransactions.length > 15) {
          const smallTotal = smallTransactions.reduce((sum, t) => sum + t.amount, 0);
          insights.push({
            id: `insight-small-food-${Date.now()}`,
            type: 'suggestion',
            title: 'Gastos pequeños frecuentes en comida',
            description: `Has hecho ${smallTransactions.length} compras pequeñas de comida este mes ($${smallTotal.toFixed(2)}). Considera preparar comidas en casa o comprar café en termo.`,
            category: 'food',
            potentialSavings: smallTotal * 0.6, // 60% de ahorro potencial
            actionable: true,
            priority: 'medium',
            createdAt: now,
          });
        }
      }

      // Detectar suscripciones o gastos recurrentes no utilizados
      if (category === 'entertainment') {
        const recurring = this.identifyRecurringTransactions(categoryExpenses);
        recurring.forEach((pattern) => {
          insights.push({
            id: `insight-subscription-${Date.now()}-${pattern.merchantName}`,
            type: 'suggestion',
            title: 'Posible suscripción no utilizada',
            description: `Tienes un cargo recurrente de $${pattern.amount.toFixed(2)} en ${pattern.merchantName}. ¿Realmente lo estás usando?`,
            category: 'entertainment',
            potentialSavings: pattern.amount * 12, // Ahorro anual
            actionable: true,
            priority: 'high',
            createdAt: now,
          });
        });
      }

      // Detectar gastos excesivos en shopping
      if (category === 'shopping' && total > 500) {
        insights.push({
          id: `insight-excessive-shopping-${Date.now()}`,
          type: 'warning',
          title: 'Gasto alto en compras',
          description: `Has gastado $${total.toFixed(2)} en compras este mes. Considera establecer un presupuesto mensual.`,
          category: 'shopping',
          potentialSavings: total * 0.3, // 30% de ahorro potencial
          actionable: true,
          priority: 'high',
          createdAt: now,
        });
      }
    });

    return insights;
  }

  /**
   * Identifica transacciones recurrentes (suscripciones)
   */
  private identifyRecurringTransactions(
    transactions: Transaction[]
  ): Array<{ merchantName: string; amount: number; frequency: number }> {
    const merchantMap = new Map<string, Transaction[]>();

    // Agrupar por comerciante
    transactions.forEach((t) => {
      const merchant = t.merchantName || t.description;
      const existing = merchantMap.get(merchant) || [];
      merchantMap.set(merchant, [...existing, t]);
    });

    const recurring: Array<{ merchantName: string; amount: number; frequency: number }> = [];

    // Buscar patrones recurrentes
    merchantMap.forEach((txs, merchant) => {
      if (txs.length < 2) return;

      // Verificar si los montos son similares
      const amounts = txs.map((t) => t.amount);
      const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
      const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;

      // Si la varianza es baja, probablemente sea recurrente
      if (variance < avgAmount * 0.1) {
        // 10% de variación
        recurring.push({
          merchantName: merchant,
          amount: avgAmount,
          frequency: txs.length,
        });
      }
    });

    return recurring;
  }

  /**
   * Detecta gastos recurrentes y los marca
   */
  private detectRecurringExpenses(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const recurring = this.identifyRecurringTransactions(
      transactions.filter((t) => t.type === 'expense')
    );

    const totalRecurring = recurring.reduce((sum, r) => sum + r.amount, 0);

    if (totalRecurring > 0) {
      insights.push({
        id: `insight-recurring-${Date.now()}`,
        type: 'suggestion',
        title: 'Gastos recurrentes identificados',
        description: `Tienes $${totalRecurring.toFixed(2)} en gastos recurrentes mensuales. Revisa si todos son necesarios.`,
        actionable: true,
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Detecta gastos inusuales comparado con el promedio
   */
  private detectUnusualSpending(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const twoMonthsAgo = startOfMonth(subMonths(now, 2));

    // Calcular gastos por categoría para los últimos 3 meses
    const categories: TransactionCategory[] = [
      'food',
      'transportation',
      'entertainment',
      'utilities',
      'shopping',
      'healthcare',
    ];

    categories.forEach((category) => {
      const thisMonthExpenses = transactions.filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          t.date >= thisMonth
      );

      const lastMonthExpenses = transactions.filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          t.date >= lastMonth &&
          t.date < thisMonth
      );

      const twoMonthsExpenses = transactions.filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          t.date >= twoMonthsAgo &&
          t.date < lastMonth
      );

      const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const twoMonthsTotal = twoMonthsExpenses.reduce((sum, t) => sum + t.amount, 0);

      const average = (lastMonthTotal + twoMonthsTotal) / 2;

      // Si el gasto actual es 50% mayor que el promedio
      if (thisMonthTotal > average * 1.5 && average > 0) {
        const increase = thisMonthTotal - average;
        insights.push({
          id: `insight-unusual-${category}-${Date.now()}`,
          type: 'warning',
          title: `Gasto elevado en ${this.getCategoryName(category)}`,
          description: `Has gastado $${thisMonthTotal.toFixed(2)} en ${this.getCategoryName(category)} este mes, $${increase.toFixed(2)} más que tu promedio.`,
          category,
          actionable: true,
          priority: 'high',
          createdAt: now,
        });
      }
    });

    return insights;
  }

  /**
   * Sugiere optimizaciones de presupuesto
   */
  private suggestBudgetOptimizations(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const thisMonth = startOfMonth(now);

    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date >= thisMonth
    );

    const monthIncome = transactions.filter(
      (t) => t.type === 'income' && t.date >= thisMonth
    );

    const totalExpenses = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = monthIncome.reduce((sum, t) => sum + t.amount, 0);

    // Si gastas más del 90% de tus ingresos
    if (totalIncome > 0 && totalExpenses / totalIncome > 0.9) {
      insights.push({
        id: `insight-high-spending-${Date.now()}`,
        type: 'warning',
        title: 'Nivel de gastos muy alto',
        description: `Estás gastando ${((totalExpenses / totalIncome) * 100).toFixed(0)}% de tus ingresos. Intenta ahorrar al menos 10-20%.`,
        actionable: true,
        priority: 'high',
        createdAt: now,
      });
    }

    // Sugerir regla 50/30/20
    if (totalIncome > 0) {
      const needs = totalIncome * 0.5; // 50% necesidades
      const wants = totalIncome * 0.3; // 30% deseos
      const savings = totalIncome * 0.2; // 20% ahorros

      insights.push({
        id: `insight-budget-rule-${Date.now()}`,
        type: 'suggestion',
        title: 'Aplica la regla 50/30/20',
        description: `Para tus ingresos de $${totalIncome.toFixed(2)}, intenta: $${needs.toFixed(2)} en necesidades, $${wants.toFixed(2)} en deseos, y $${savings.toFixed(2)} en ahorros.`,
        actionable: true,
        priority: 'medium',
        createdAt: now,
      });
    }

    return insights;
  }

  /**
   * Analiza oportunidades para maximizar ingresos
   */
  private analyzeIncomeOpportunities(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const lastThreeMonths = subMonths(now, 3);

    const incomeTransactions = transactions.filter(
      (t) => t.type === 'income' && t.date >= lastThreeMonths
    );

    if (incomeTransactions.length === 0) return insights;

    // Analizar consistencia de ingresos
    const monthlyIncome = this.groupByMonth(incomeTransactions);
    const incomeValues = Object.values(monthlyIncome);

    if (incomeValues.length >= 2) {
      const avgIncome = incomeValues.reduce((sum, val) => sum + val, 0) / incomeValues.length;
      const variance = incomeValues.reduce(
        (sum, val) => sum + Math.pow(val - avgIncome, 2),
        0
      ) / incomeValues.length;

      // Si hay mucha variación en ingresos
      if (variance > avgIncome * 0.3) {
        insights.push({
          id: `insight-income-variability-${Date.now()}`,
          type: 'suggestion',
          title: 'Ingresos variables detectados',
          description: 'Tus ingresos varían significativamente. Considera buscar fuentes de ingreso más estables o crear un fondo de emergencia.',
          actionable: true,
          priority: 'medium',
          createdAt: now,
        });
      }
    }

    // Sugerir oportunidades de ingreso adicional
    if (incomeTransactions.length < 5) {
      insights.push({
        id: `insight-additional-income-${Date.now()}`,
        type: 'suggestion',
        title: 'Considera ingresos adicionales',
        description: 'Podrías mejorar tu situación financiera con un trabajo freelance, venta de artículos no usados, o inversiones.',
        actionable: true,
        priority: 'low',
        createdAt: now,
      });
    }

    return insights;
  }

  /**
   * Detecta patrones en ingresos
   */
  private detectIncomePatterns(transactions: Transaction[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const lastThreeMonths = subMonths(now, 3);

    const incomeTransactions = transactions.filter(
      (t) => t.type === 'income' && t.date >= lastThreeMonths
    );

    // Identificar fuentes de ingreso recurrentes
    const sources = this.identifyRecurringTransactions(incomeTransactions);

    if (sources.length > 0) {
      const totalRecurring = sources.reduce((sum, s) => sum + s.amount, 0);

      insights.push({
        id: `insight-recurring-income-${Date.now()}`,
        type: 'achievement',
        title: 'Ingresos recurrentes estables',
        description: `Tienes $${totalRecurring.toFixed(2)} en ingresos recurrentes mensuales. ¡Buen trabajo!`,
        actionable: false,
        priority: 'low',
        createdAt: now,
      });
    }

    return insights;
  }

  /**
   * Agrupa transacciones por mes
   */
  private groupByMonth(transactions: Transaction[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    transactions.forEach((t) => {
      const monthKey = format(t.date, 'yyyy-MM');
      grouped[monthKey] = (grouped[monthKey] || 0) + t.amount;
    });

    return grouped;
  }

  /**
   * Obtiene el nombre legible de una categoría
   */
  private getCategoryName(category: TransactionCategory): string {
    const names: Record<TransactionCategory, string> = {
      food: 'comida',
      transportation: 'transporte',
      entertainment: 'entretenimiento',
      utilities: 'servicios',
      rent: 'renta',
      healthcare: 'salud',
      shopping: 'compras',
      education: 'educación',
      salary: 'salario',
      investment: 'inversión',
      other: 'otros',
    };

    return names[category] || category;
  }

  /**
   * Categoriza automáticamente una transacción basándose en su descripción
   */
  categorizeTransaction(description: string, merchantName?: string): TransactionCategory {
    const text = `${description} ${merchantName || ''}`.toLowerCase();

    // Comida
    if (
      text.includes('restaurant') ||
      text.includes('food') ||
      text.includes('cafe') ||
      text.includes('coffee') ||
      text.includes('pizza') ||
      text.includes('burger') ||
      text.includes('grocery') ||
      text.includes('supermarket') ||
      text.includes('market')
    ) {
      return 'food';
    }

    // Transporte
    if (
      text.includes('uber') ||
      text.includes('lyft') ||
      text.includes('gas') ||
      text.includes('fuel') ||
      text.includes('parking') ||
      text.includes('transit') ||
      text.includes('metro') ||
      text.includes('bus')
    ) {
      return 'transportation';
    }

    // Entretenimiento
    if (
      text.includes('netflix') ||
      text.includes('spotify') ||
      text.includes('hulu') ||
      text.includes('disney') ||
      text.includes('hbo') ||
      text.includes('movie') ||
      text.includes('theater') ||
      text.includes('concert') ||
      text.includes('game')
    ) {
      return 'entertainment';
    }

    // Servicios públicos
    if (
      text.includes('electric') ||
      text.includes('water') ||
      text.includes('gas utility') ||
      text.includes('internet') ||
      text.includes('phone') ||
      text.includes('cable')
    ) {
      return 'utilities';
    }

    // Renta
    if (text.includes('rent') || text.includes('lease') || text.includes('mortgage')) {
      return 'rent';
    }

    // Salud
    if (
      text.includes('pharmacy') ||
      text.includes('doctor') ||
      text.includes('hospital') ||
      text.includes('medical') ||
      text.includes('health')
    ) {
      return 'healthcare';
    }

    // Compras
    if (
      text.includes('amazon') ||
      text.includes('walmart') ||
      text.includes('target') ||
      text.includes('store') ||
      text.includes('shop')
    ) {
      return 'shopping';
    }

    // Salario
    if (
      text.includes('salary') ||
      text.includes('payroll') ||
      text.includes('direct deposit') ||
      text.includes('payment received')
    ) {
      return 'salary';
    }

    return 'other';
  }
}

export const intelligenceService = new IntelligenceService();
export default intelligenceService;
