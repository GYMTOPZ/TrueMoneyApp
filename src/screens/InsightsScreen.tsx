import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import { FinancialInsight } from '../types';

const InsightsScreen = () => {
  const { insights } = useFinanceStore();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getInsightIcon = (type: FinancialInsight['type']): keyof typeof Ionicons.glyphMap => {
    const icons = {
      warning: 'warning',
      suggestion: 'bulb',
      achievement: 'trophy',
    };
    return icons[type];
  };

  const getInsightColor = (type: FinancialInsight['type']): string => {
    const colors = {
      warning: '#FF9800',
      suggestion: '#2196F3',
      achievement: '#4CAF50',
    };
    return colors[type];
  };

  const getPriorityColor = (priority: FinancialInsight['priority']): string => {
    const colors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#4CAF50',
    };
    return colors[priority];
  };

  // Agrupar insights por prioridad
  const highPriority = insights.filter((i) => i.priority === 'high');
  const mediumPriority = insights.filter((i) => i.priority === 'medium');
  const lowPriority = insights.filter((i) => i.priority === 'low');

  // Calcular ahorros potenciales totales
  const totalPotentialSavings = insights.reduce(
    (sum, i) => sum + (i.potentialSavings || 0),
    0
  );

  const renderInsight = (insight: FinancialInsight) => (
    <TouchableOpacity
      key={insight.id}
      style={[
        styles.insightCard,
        { borderLeftColor: getInsightColor(insight.type) },
      ]}
    >
      <View style={styles.insightHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getInsightColor(insight.type) + '20' },
          ]}
        >
          <Ionicons
            name={getInsightIcon(insight.type)}
            size={24}
            color={getInsightColor(insight.type)}
          />
        </View>
        <View style={styles.insightTitleContainer}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(insight.priority) },
            ]}
          >
            <Text style={styles.priorityText}>
              {insight.priority === 'high'
                ? 'Alta'
                : insight.priority === 'medium'
                ? 'Media'
                : 'Baja'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.potentialSavings && insight.potentialSavings > 0 && (
        <View style={styles.savingsContainer}>
          <Ionicons name="cash-outline" size={16} color="#4CAF50" />
          <Text style={styles.savingsText}>
            Ahorro potencial: {formatCurrency(insight.potentialSavings)}
          </Text>
        </View>
      )}
      {insight.actionable && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Tomar acción</Text>
            <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights Financieros</Text>
        <Text style={styles.subtitle}>
          Sugerencias personalizadas para mejorar tus finanzas
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Resumen de ahorros potenciales */}
        {totalPotentialSavings > 0 && (
          <View style={styles.savingsSummary}>
            <Ionicons name="trending-up" size={32} color="#4CAF50" />
            <View style={styles.savingsSummaryText}>
              <Text style={styles.savingsSummaryLabel}>
                Ahorro Potencial Total
              </Text>
              <Text style={styles.savingsSummaryAmount}>
                {formatCurrency(totalPotentialSavings)}
              </Text>
            </View>
          </View>
        )}

        {insights.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay insights disponibles</Text>
            <Text style={styles.emptySubtext}>
              Agrega más transacciones para recibir sugerencias personalizadas
            </Text>
          </View>
        ) : (
          <>
            {/* Alta Prioridad */}
            {highPriority.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="alert-circle" size={24} color="#F44336" />
                  <Text style={styles.sectionTitle}>
                    Requiere Atención ({highPriority.length})
                  </Text>
                </View>
                {highPriority.map(renderInsight)}
              </View>
            )}

            {/* Prioridad Media */}
            {mediumPriority.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={24} color="#FF9800" />
                  <Text style={styles.sectionTitle}>
                    Sugerencias ({mediumPriority.length})
                  </Text>
                </View>
                {mediumPriority.map(renderInsight)}
              </View>
            )}

            {/* Baja Prioridad */}
            {lowPriority.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={24} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>
                    Logros y Consejos ({lowPriority.length})
                  </Text>
                </View>
                {lowPriority.map(renderInsight)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
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
  scrollView: {
    flex: 1,
  },
  savingsSummary: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  savingsSummaryText: {
    marginLeft: 15,
    flex: 1,
  },
  savingsSummaryLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 5,
  },
  savingsSummaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  savingsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
  actionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default InsightsScreen;
