import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../store/useFinanceStore';
import { BankAccount } from '../types';

const AccountsScreen = () => {
  const { accounts, removeAccount } = useFinanceStore();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountTypeIcon = (type: BankAccount['accountType']): keyof typeof Ionicons.glyphMap => {
    const icons = {
      checking: 'card',
      savings: 'wallet',
      credit: 'card-outline',
    };
    return icons[type];
  };

  const getAccountTypeName = (type: BankAccount['accountType']): string => {
    const names = {
      checking: 'Cuenta Corriente',
      savings: 'Cuenta de Ahorros',
      credit: 'Tarjeta de Crédito',
    };
    return names[type];
  };

  const handleDeleteAccount = (account: BankAccount) => {
    Alert.alert(
      'Eliminar Cuenta',
      `¿Estás seguro de que quieres eliminar la cuenta ${account.accountNumber}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeAccount(account.id),
        },
      ]
    );
  };

  const renderAccount = ({ item }: { item: BankAccount }) => (
    <TouchableOpacity style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountIconContainer}>
          <Ionicons
            name={getAccountTypeIcon(item.accountType)}
            size={32}
            color="#007AFF"
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountBank}>{item.bankName}</Text>
          <Text style={styles.accountType}>
            {getAccountTypeName(item.accountType)}
          </Text>
          <Text style={styles.accountNumber}>•••• {item.accountNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAccount(item)}
        >
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
      <View style={styles.accountBalance}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            {
              color:
                item.accountType === 'credit'
                  ? item.balance < 0
                    ? '#F44336'
                    : '#4CAF50'
                  : '#333',
            },
          ]}
        >
          {formatCurrency(item.balance)} {item.currency}
        </Text>
      </View>
      <View style={styles.accountFooter}>
        <Text style={styles.lastSync}>
          Última actualización:{' '}
          {new Date(item.lastSync).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cuentas</Text>
      </View>

      {/* Total Balance Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Balance Total</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.summarySubtext}>
          {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de cuentas */}
      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tienes cuentas agregadas</Text>
          <Text style={styles.emptySubtext}>
            Importa transacciones para crear automáticamente tus cuentas
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addButtonText}>Agregar Cuenta Manualmente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Botón flotante para agregar cuenta */}
      {accounts.length > 0 && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}
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
  summaryCard: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  listContainer: {
    padding: 15,
  },
  accountCard: {
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
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountBank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  accountBalance: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSync: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AccountsScreen;
