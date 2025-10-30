import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { DailyBudget } from '../types';

interface DailyBudgetCircleProps {
  dailyBudget: DailyBudget;
}

const DailyBudgetCircle: React.FC<DailyBudgetCircleProps> = ({ dailyBudget }) => {
  const size = Dimensions.get('window').width * 0.7;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular progreso
  const progress = Math.min(dailyBudget.percentageUsed, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determinar color basado en el porcentaje usado
  const getColor = () => {
    if (progress < 50) return '#4CAF50'; // Verde
    if (progress < 75) return '#FFC107'; // Amarillo
    if (progress < 100) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          {/* Círculo de fondo */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Círculo de progreso */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Texto central */}
        <View style={styles.centerText}>
          <Text style={styles.labelSmall}>Disponible hoy</Text>
          <Text style={[styles.amountLarge, { color: getColor() }]}>
            {formatCurrency(dailyBudget.remaining)}
          </Text>
          <Text style={styles.labelMedium}>
            de {formatCurrency(dailyBudget.availableToSpend)}
          </Text>
        </View>
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gastado hoy</Text>
            <Text style={[styles.infoValue, { color: '#F44336' }]}>
              {formatCurrency(dailyBudget.spent)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Porcentaje usado</Text>
            <Text style={[styles.infoValue, { color: getColor() }]}>
              {progress.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Mensajes motivacionales o de advertencia */}
      {progress < 50 && (
        <View style={[styles.messageBox, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.messageText, { color: '#2E7D32' }]}>
            ¡Excelente! Vas muy bien con tu presupuesto diario
          </Text>
        </View>
      )}
      {progress >= 50 && progress < 90 && (
        <View style={[styles.messageBox, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.messageText, { color: '#E65100' }]}>
            Vas por buen camino, pero ten cuidado con los gastos adicionales
          </Text>
        </View>
      )}
      {progress >= 90 && progress < 100 && (
        <View style={[styles.messageBox, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.messageText, { color: '#C62828' }]}>
            ¡Atención! Estás cerca del límite de tu presupuesto diario
          </Text>
        </View>
      )}
      {progress >= 100 && (
        <View style={[styles.messageBox, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.messageText, { color: '#C62828' }]}>
            Has excedido tu presupuesto diario. Intenta reducir gastos mañana.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelSmall: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  labelMedium: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  amountLarge: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    marginTop: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DailyBudgetCircle;
