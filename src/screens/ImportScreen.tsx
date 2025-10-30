import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useFinanceStore } from '../store/useFinanceStore';
import { fileImportService } from '../services/fileImportService';
import { intelligenceService } from '../services/intelligenceService';

const ImportScreen = () => {
  const [importing, setImporting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const { addTransaction, addAccount } = useFinanceStore();

  const banks = [
    { id: 'bankOfAmerica', name: 'Bank of America', icon: 'business' },
    { id: 'chase', name: 'Chase', icon: 'business' },
    { id: 'wellsFargo', name: 'Wells Fargo', icon: 'business' },
    { id: 'citi', name: 'Citi', icon: 'business' },
    { id: 'capitalOne', name: 'Capital One', icon: 'business' },
    { id: 'amex', name: 'American Express', icon: 'card' },
    { id: 'auto', name: 'Detectar Automáticamente', icon: 'flash' },
  ];

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Leer el contenido del archivo
      const response = await fetch(file.uri);
      const content = await response.text();

      handleImport(content);
    } catch (error) {
      Alert.alert('Error', 'No se pudo leer el archivo');
      console.error('File pick error:', error);
    }
  };

  const handleImport = async (content: string) => {
    setImporting(true);

    try {
      // Validar archivo
      const validation = fileImportService.validateFile(content);
      if (!validation.valid) {
        Alert.alert('Error', validation.error || 'Archivo inválido');
        setImporting(false);
        return;
      }

      // Importar transacciones
      const result = await fileImportService.importCSV(
        content,
        selectedBank || undefined
      );

      if (result.errors.length > 0 && result.transactions.length === 0) {
        Alert.alert(
          'Error al Importar',
          `No se pudieron importar las transacciones:\n${result.errors.slice(0, 3).join('\n')}`
        );
        setImporting(false);
        return;
      }

      // Categorizar transacciones automáticamente
      const categorizedTransactions = result.transactions.map((t) => ({
        ...t,
        category: intelligenceService.categorizeTransaction(
          t.description,
          t.merchantName
        ),
      }));

      // Agregar transacciones al store
      categorizedTransactions.forEach((t) => {
        addTransaction(t);
      });

      // Crear cuenta si no existe
      if (result.accountInfo) {
        const account = {
          id: `account-${Date.now()}`,
          bankName: selectedBank || 'Unknown',
          accountNumber: '****',
          accountType: 'checking' as const,
          balance: 0,
          currency: 'USD',
          lastSync: new Date(),
          ...result.accountInfo,
        };
        addAccount(account);
      }

      setImporting(false);

      // Mostrar resultado
      Alert.alert(
        'Importación Exitosa',
        `Se importaron ${categorizedTransactions.length} transacciones.\n${
          result.errors.length > 0
            ? `\n${result.errors.length} transacciones no pudieron ser procesadas.`
            : ''
        }`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setImporting(false);
      Alert.alert('Error', 'Ocurrió un error durante la importación');
      console.error('Import error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="cloud-upload" size={64} color="#007AFF" />
          <Text style={styles.title}>Importar Transacciones</Text>
          <Text style={styles.subtitle}>
            Selecciona tu banco y sube el archivo CSV de tus transacciones
          </Text>
        </View>

        {/* Seleccionar Banco */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona tu Banco</Text>
          <View style={styles.banksGrid}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankCard,
                  selectedBank === bank.id && styles.bankCardSelected,
                ]}
                onPress={() => setSelectedBank(bank.id)}
              >
                <Ionicons
                  name={bank.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={selectedBank === bank.id ? '#007AFF' : '#666'}
                />
                <Text
                  style={[
                    styles.bankName,
                    selectedBank === bank.id && styles.bankNameSelected,
                  ]}
                >
                  {bank.name}
                </Text>
                {selectedBank === bank.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#007AFF"
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subir Archivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Sube tu Archivo CSV</Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              !selectedBank && styles.uploadButtonDisabled,
            ]}
            onPress={handleFilePick}
            disabled={!selectedBank || importing}
          >
            {importing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={24} color="#FFF" />
                <Text style={styles.uploadButtonText}>Seleccionar Archivo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instrucciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cómo obtener tu archivo CSV:</Text>

          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.instructionTitle}>Bank of America</Text>
            </View>
            <Text style={styles.instructionText}>
              1. Ingresa a tu cuenta en línea{'\n'}
              2. Ve a "Accounts" {'>'} "Account Activity"{'\n'}
              3. Selecciona "Download" y elige formato CSV
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.instructionTitle}>Chase</Text>
            </View>
            <Text style={styles.instructionText}>
              1. Ingresa a Chase.com{'\n'}
              2. Selecciona tu cuenta{'\n'}
              3. Click en "Download activity" y selecciona CSV
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.instructionTitle}>Wells Fargo</Text>
            </View>
            <Text style={styles.instructionText}>
              1. Ingresa a tu cuenta en línea{'\n'}
              2. Click en "Download Transactions"{'\n'}
              3. Selecciona formato CSV o Comma Delimited
            </Text>
          </View>
        </View>

        {/* Información de Seguridad */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
          <Text style={styles.securityTitle}>100% Seguro y Privado</Text>
          <Text style={styles.securityText}>
            Tus datos se procesan localmente en tu dispositivo. No se envía ninguna
            información a servidores externos. Tu información bancaria está segura.
          </Text>
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
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bankCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  bankCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  bankName: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  bankNameSelected: {
    color: '#007AFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  instructionCard: {
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
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  securityCard: {
    margin: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ImportScreen;
