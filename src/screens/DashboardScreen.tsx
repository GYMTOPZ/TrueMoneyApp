import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import DailyBudgetCircle from '../components/DailyBudgetCircle';

const DashboardScreen = () => {
  const {
    dailyBudget,
    insights,
    transactions,
    calculateDailyBudget,
    analyzeSpendingPatterns,
    analyzeIncomePatterns,
    generateInsights,
  } = useFinanceStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, [transactions]);

  const loadData = () => {
    analyzeSpendingPatterns();
    analyzeIncomePatterns();
    calculateDailyBudget();
    generateInsights();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  // Obtener insights de alta prioridad
  const highPriorityInsights = insights
    .filter((i) => i.priority === 'high')
    .slice(0, 3);

  // Calcular resumen del mes
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date >= thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthIncome = transactions
    .filter((t) => t.type === 'income' && t.date >= thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TrueMoney</Text>
          <Text style={styles.subtitle}>Tu asistente financiero inteligente</Text>
        </View>

        {/* Daily Budget Circle */}
        {dailyBudget ? (
          <DailyBudgetCircle dailyBudget={dailyBudget} />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              Importa tus transacciones para ver tu presupuesto diario
            </Text>
          </View>
        )}

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Resumen del Mes</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons name="arrow-down-circle" size={32} color="#4CAF50" />
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
                {formatCurrency(monthIncome)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="arrow-up-circle" size={32} color="#F44336" />
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryAmount, { color: '#F44336' }]}>
                {formatCurrency(monthExpenses)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={32} color="#2196F3" />
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: monthIncome - monthExpenses >= 0 ? '#4CAF50' : '#F44336' },
              ]}
            >
              {formatCurrency(monthIncome - monthExpenses)}
            </Text>
          </View>
        </View>

        {/* High Priority Insights */}
        {highPriorityInsights.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Alertas Importantes</Text>
            {highPriorityInsights.map((insight) => (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  {
                    borderLeftColor:
                      insight.type === 'warning'
                        ? '#FF9800'
                        : insight.type === 'suggestion'
                        ? '#2196F3'
                        : '#4CAF50',
                  },
                ]}
              >
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={
                      insight.type === 'warning'
                        ? 'warning'
                        : insight.type === 'suggestion'
                        ? 'bulb'
                        : 'checkmark-circle'
                    }
                    size={24}
                    color={
                      insight.type === 'warning'
                        ? '#FF9800'
                        : insight.type === 'suggestion'
                        ? '#2196F3'
                        : '#4CAF50'
                    }
                  />
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                {insight.potentialSavings && (
                  <Text style={styles.insightSavings}>
                    Ahorro potencial: {formatCurrency(insight.potentialSavings)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Importar Transacciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Ver Análisis Completo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  insightsContainer: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  insightSavings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default DashboardScreen;
