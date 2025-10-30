import axios from 'axios';
import { BankAccount, Transaction } from '../types';

/**
 * Servicio para integración con APIs bancarias
 *
 * Este servicio maneja la conexión con diferentes APIs bancarias.
 * Soporta múltiples proveedores bancarios y protocolos de autenticación.
 *
 * Protocolos soportados:
 * - Open Banking API (estándar europeo)
 * - Plaid (API común en América)
 * - APIs propietarias de bancos individuales
 */

// Configuración base para diferentes proveedores
interface BankProvider {
  name: string;
  baseUrl: string;
  authType: 'oauth2' | 'api_key' | 'basic';
  scopes?: string[];
}

// Proveedores populares (ejemplos)
const BANK_PROVIDERS: Record<string, BankProvider> = {
  plaid: {
    name: 'Plaid',
    baseUrl: 'https://production.plaid.com',
    authType: 'api_key',
    scopes: ['transactions', 'balance', 'identity'],
  },
  openbanking: {
    name: 'Open Banking',
    baseUrl: 'https://api.openbanking.org',
    authType: 'oauth2',
    scopes: ['accounts', 'transactions'],
  },
  // Agregar más proveedores según sea necesario
};

class BankService {
  private apiClient = axios.create({
    timeout: 30000,
  });

  /**
   * Autentica con un banco usando OAuth2
   */
  async authenticateOAuth(
    provider: string,
    authCode: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const bankProvider = BANK_PROVIDERS[provider];
    if (!bankProvider) {
      throw new Error(`Proveedor bancario no soportado: ${provider}`);
    }

    try {
      // TODO: Implementar flujo OAuth2 real
      // Este es un ejemplo de cómo sería el flujo
      const response = await this.apiClient.post(
        `${bankProvider.baseUrl}/oauth/token`,
        {
          grant_type: 'authorization_code',
          code: authCode,
          client_id: process.env.BANK_CLIENT_ID,
          client_secret: process.env.BANK_CLIENT_SECRET,
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      };
    } catch (error) {
      console.error('Error en autenticación OAuth:', error);
      throw new Error('Fallo en la autenticación bancaria');
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(
    provider: string,
    refreshToken: string
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const bankProvider = BANK_PROVIDERS[provider];

    try {
      const response = await this.apiClient.post(
        `${bankProvider.baseUrl}/oauth/refresh`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.BANK_CLIENT_ID,
          client_secret: process.env.BANK_CLIENT_SECRET,
        }
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      return {
        accessToken: access_token,
        expiresAt,
      };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw new Error('No se pudo refrescar el token de acceso');
    }
  }

  /**
   * Obtiene las cuentas bancarias del usuario
   */
  async getAccounts(
    provider: string,
    accessToken: string
  ): Promise<BankAccount[]> {
    const bankProvider = BANK_PROVIDERS[provider];

    try {
      const response = await this.apiClient.get(
        `${bankProvider.baseUrl}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Transformar respuesta al formato de nuestra app
      return response.data.accounts.map((acc: any) => ({
        id: acc.account_id,
        bankName: provider,
        accountNumber: acc.mask || acc.account_number,
        accountType: this.mapAccountType(acc.type),
        balance: acc.balances.current,
        currency: acc.balances.iso_currency_code || 'USD',
        lastSync: new Date(),
        apiCredentials: {
          accessToken,
        },
      }));
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      throw new Error('No se pudieron cargar las cuentas');
    }
  }

  /**
   * Obtiene transacciones de una cuenta
   */
  async getTransactions(
    provider: string,
    accessToken: string,
    accountId: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<Transaction[]> {
    const bankProvider = BANK_PROVIDERS[provider];

    try {
      const response = await this.apiClient.post(
        `${bankProvider.baseUrl}/transactions/get`,
        {
          access_token: accessToken,
          account_id: accountId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }
      );

      // Transformar respuesta al formato de nuestra app
      return response.data.transactions.map((tx: any) => ({
        id: tx.transaction_id,
        accountId,
        date: new Date(tx.date),
        description: tx.name,
        amount: Math.abs(tx.amount),
        type: tx.amount < 0 ? 'expense' : 'income',
        category: this.categorizeTransaction(tx.category?.[0] || 'other'),
        isRecurring: false, // Se determinará con análisis
        merchantName: tx.merchant_name,
        location: tx.location?.city,
      }));
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw new Error('No se pudieron cargar las transacciones');
    }
  }

  /**
   * Sincroniza todas las cuentas y transacciones
   */
  async syncAllAccounts(accounts: BankAccount[]): Promise<{
    transactions: Transaction[];
    updatedAccounts: BankAccount[];
  }> {
    const allTransactions: Transaction[] = [];
    const updatedAccounts: BankAccount[] = [];

    for (const account of accounts) {
      try {
        if (!account.apiCredentials?.accessToken) {
          continue;
        }

        // Obtener transacciones de los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await this.getTransactions(
          account.bankName.toLowerCase(),
          account.apiCredentials.accessToken,
          account.id,
          thirtyDaysAgo
        );

        allTransactions.push(...transactions);

        // Actualizar fecha de sincronización
        updatedAccounts.push({
          ...account,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error(`Error sincronizando cuenta ${account.id}:`, error);
        // Continuar con las demás cuentas
      }
    }

    return {
      transactions: allTransactions,
      updatedAccounts,
    };
  }

  /**
   * Mapea tipos de cuenta de diferentes proveedores a nuestro formato
   */
  private mapAccountType(type: string): 'checking' | 'savings' | 'credit' {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('checking') || lowerType.includes('corriente')) {
      return 'checking';
    }
    if (lowerType.includes('savings') || lowerType.includes('ahorro')) {
      return 'savings';
    }
    if (lowerType.includes('credit') || lowerType.includes('credito')) {
      return 'credit';
    }
    return 'checking'; // default
  }

  /**
   * Categoriza transacciones basándose en la descripción
   */
  private categorizeTransaction(category: string): any {
    const categoryMap: Record<string, string> = {
      'Food and Drink': 'food',
      'Restaurants': 'food',
      'Groceries': 'food',
      'Transportation': 'transportation',
      'Travel': 'transportation',
      'Entertainment': 'entertainment',
      'Recreation': 'entertainment',
      'Shops': 'shopping',
      'Healthcare': 'healthcare',
      'Utilities': 'utilities',
      'Rent': 'rent',
      'Education': 'education',
      'Income': 'salary',
      'Transfer': 'other',
    };

    return categoryMap[category] || 'other';
  }

  /**
   * Verifica si el token está por expirar y lo refresca si es necesario
   */
  async ensureValidToken(
    account: BankAccount
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const credentials = account.apiCredentials;
    if (!credentials) {
      throw new Error('Cuenta sin credenciales');
    }

    // Si el token expira en menos de 5 minutos, refrescarlo
    if (credentials.expiresAt) {
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      if (credentials.expiresAt < fiveMinutesFromNow && credentials.refreshToken) {
        return await this.refreshToken(
          account.bankName.toLowerCase(),
          credentials.refreshToken
        );
      }
    }

    return {
      accessToken: credentials.accessToken,
      expiresAt: credentials.expiresAt || new Date(Date.now() + 3600 * 1000),
    };
  }
}

export const bankService = new BankService();
export default bankService;
