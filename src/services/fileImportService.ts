import { Transaction, BankAccount } from '../types';

/**
 * Servicio para importación de archivos bancarios
 *
 * Soporta múltiples formatos de bancos populares:
 * - Bank of America (CSV)
 * - Chase (CSV)
 * - Wells Fargo (CSV)
 * - Citi (CSV)
 * - Capital One (CSV)
 * - American Express (CSV)
 * - Y más...
 */

interface ImportResult {
  transactions: Transaction[];
  accountInfo?: Partial<BankAccount>;
  errors: string[];
}

// Patrones de columnas para diferentes bancos
const BANK_PATTERNS = {
  bankOfAmerica: {
    name: 'Bank of America',
    dateColumns: ['Posted Date', 'Date'],
    descriptionColumns: ['Payee', 'Description'],
    amountColumns: ['Amount'],
    typeColumn: null, // Se infiere del signo
    accountColumns: ['Account'],
  },
  chase: {
    name: 'Chase',
    dateColumns: ['Posting Date', 'Transaction Date'],
    descriptionColumns: ['Description'],
    amountColumns: ['Amount'],
    typeColumn: 'Type',
    accountColumns: ['Account'],
  },
  wellsFargo: {
    name: 'Wells Fargo',
    dateColumns: ['Date'],
    descriptionColumns: ['Description', 'Merchant'],
    amountColumns: ['Amount'],
    typeColumn: null,
    accountColumns: ['Account Number'],
  },
  citi: {
    name: 'Citi',
    dateColumns: ['Date'],
    descriptionColumns: ['Description'],
    amountColumns: ['Debit', 'Credit'],
    typeColumn: null,
    accountColumns: [],
  },
  capitalOne: {
    name: 'Capital One',
    dateColumns: ['Transaction Date'],
    descriptionColumns: ['Description'],
    amountColumns: ['Debit', 'Credit'],
    typeColumn: null,
    accountColumns: ['Account Number'],
  },
  amex: {
    name: 'American Express',
    dateColumns: ['Date'],
    descriptionColumns: ['Description'],
    amountColumns: ['Amount'],
    typeColumn: null,
    accountColumns: ['Card Member'],
  },
};

class FileImportService {
  /**
   * Importa transacciones desde un archivo CSV
   */
  async importCSV(fileContent: string, bankName?: string): Promise<ImportResult> {
    const errors: string[] = [];
    const transactions: Transaction[] = [];

    try {
      // Parsear CSV
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('Archivo vacío o sin datos');
      }

      const headers = this.parseCSVLine(lines[0]);
      const bankPattern = bankName
        ? this.detectBankPattern(headers, bankName)
        : this.autoDetectBank(headers);

      if (!bankPattern) {
        throw new Error('Formato de banco no reconocido. Por favor selecciona el banco manualmente.');
      }

      // Procesar cada línea
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          if (values.length < 2) continue; // Línea vacía

          const transaction = this.parseTransaction(
            headers,
            values,
            bankPattern,
            i
          );

          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(`Línea ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      return {
        transactions,
        errors,
      };
    } catch (error) {
      return {
        transactions: [],
        errors: [error instanceof Error ? error.message : 'Error al procesar archivo'],
      };
    }
  }

  /**
   * Parsea una línea CSV manejando comillas y comas dentro de campos
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Auto-detecta el banco basándose en los headers del CSV
   */
  private autoDetectBank(headers: string[]): typeof BANK_PATTERNS[keyof typeof BANK_PATTERNS] | null {
    const headerStr = headers.join(',').toLowerCase();

    // Detectar Bank of America
    if (headerStr.includes('posted date') && headerStr.includes('payee')) {
      return BANK_PATTERNS.bankOfAmerica;
    }

    // Detectar Chase
    if (headerStr.includes('posting date') || (headerStr.includes('type') && headerStr.includes('description'))) {
      return BANK_PATTERNS.chase;
    }

    // Detectar Wells Fargo
    if (headerStr.includes('wells') || (headerStr.includes('date') && headerStr.includes('amount') && headers.length <= 5)) {
      return BANK_PATTERNS.wellsFargo;
    }

    // Detectar Citi
    if (headerStr.includes('debit') && headerStr.includes('credit') && headerStr.includes('status')) {
      return BANK_PATTERNS.citi;
    }

    // Detectar Capital One
    if (headerStr.includes('transaction date') && (headerStr.includes('debit') || headerStr.includes('credit'))) {
      return BANK_PATTERNS.capitalOne;
    }

    // Detectar American Express
    if (headerStr.includes('card member') || headerStr.includes('amex')) {
      return BANK_PATTERNS.amex;
    }

    return null;
  }

  /**
   * Obtiene el patrón del banco especificado
   */
  private detectBankPattern(headers: string[], bankName: string): typeof BANK_PATTERNS[keyof typeof BANK_PATTERNS] | null {
    const normalizedName = bankName.toLowerCase().replace(/\s+/g, '');

    if (normalizedName.includes('bankofamerica') || normalizedName.includes('boa')) {
      return BANK_PATTERNS.bankOfAmerica;
    }
    if (normalizedName.includes('chase')) {
      return BANK_PATTERNS.chase;
    }
    if (normalizedName.includes('wellsfargo') || normalizedName.includes('wells')) {
      return BANK_PATTERNS.wellsFargo;
    }
    if (normalizedName.includes('citi')) {
      return BANK_PATTERNS.citi;
    }
    if (normalizedName.includes('capitalone') || normalizedName.includes('capital')) {
      return BANK_PATTERNS.capitalOne;
    }
    if (normalizedName.includes('amex') || normalizedName.includes('americanexpress')) {
      return BANK_PATTERNS.amex;
    }

    return this.autoDetectBank(headers);
  }

  /**
   * Parsea una transacción individual
   */
  private parseTransaction(
    headers: string[],
    values: string[],
    pattern: typeof BANK_PATTERNS[keyof typeof BANK_PATTERNS],
    lineNumber: number
  ): Transaction | null {
    // Crear mapa de header -> value
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });

    // Extraer fecha
    const date = this.extractDate(row, pattern.dateColumns);
    if (!date) {
      throw new Error('Fecha no encontrada o inválida');
    }

    // Extraer descripción
    const description = this.extractDescription(row, pattern.descriptionColumns);
    if (!description) {
      throw new Error('Descripción no encontrada');
    }

    // Extraer monto y tipo
    const { amount, type } = this.extractAmount(row, pattern.amountColumns, pattern.typeColumn);
    if (amount === 0) {
      return null; // Transacción sin monto
    }

    // Crear transacción
    const transaction: Transaction = {
      id: `imported-${Date.now()}-${lineNumber}`,
      accountId: '', // Se asignará después
      date,
      description,
      amount: Math.abs(amount),
      type,
      category: 'other', // Se categorizará automáticamente después
      isRecurring: false,
      merchantName: this.extractMerchantName(description),
    };

    return transaction;
  }

  /**
   * Extrae la fecha de las columnas disponibles
   */
  private extractDate(row: Record<string, string>, dateColumns: string[]): Date | null {
    for (const col of dateColumns) {
      const value = row[col];
      if (value) {
        const date = this.parseDate(value);
        if (date) return date;
      }
    }
    return null;
  }

  /**
   * Parsea diferentes formatos de fecha
   */
  private parseDate(dateStr: string): Date | null {
    // Intentar varios formatos
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // MM-DD-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];

    const cleaned = dateStr.trim();

    // Intentar parseo directo
    const directDate = new Date(cleaned);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    // Intentar con regex
    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        const [, p1, p2, p3] = match;
        // Intentar MM/DD/YYYY
        const date = new Date(`${p1}/${p2}/${p3}`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  /**
   * Extrae la descripción de las columnas disponibles
   */
  private extractDescription(row: Record<string, string>, descColumns: string[]): string {
    for (const col of descColumns) {
      const value = row[col];
      if (value && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  /**
   * Extrae el monto y tipo de transacción
   */
  private extractAmount(
    row: Record<string, string>,
    amountColumns: string[],
    typeColumn: string | null
  ): { amount: number; type: 'income' | 'expense' } {
    // Si hay columna de tipo explícita
    if (typeColumn && row[typeColumn]) {
      const typeValue = row[typeColumn].toLowerCase();
      const isDebit = typeValue.includes('debit') || typeValue.includes('withdrawal') || typeValue.includes('payment');

      const amountStr = row[amountColumns[0]] || '';
      const amount = this.parseAmount(amountStr);

      return {
        amount,
        type: isDebit ? 'expense' : 'income',
      };
    }

    // Si hay columnas separadas para débito y crédito
    if (amountColumns.length > 1) {
      const debitStr = row[amountColumns[0]] || '';
      const creditStr = row[amountColumns[1]] || '';

      const debit = this.parseAmount(debitStr);
      const credit = this.parseAmount(creditStr);

      if (debit > 0) {
        return { amount: debit, type: 'expense' };
      }
      if (credit > 0) {
        return { amount: credit, type: 'income' };
      }
      return { amount: 0, type: 'expense' };
    }

    // Una sola columna de monto (positivo/negativo indica tipo)
    const amountStr = row[amountColumns[0]] || '';
    const amount = this.parseAmount(amountStr);

    return {
      amount: Math.abs(amount),
      type: amount < 0 ? 'expense' : 'income',
    };
  }

  /**
   * Parsea un string de monto a número
   */
  private parseAmount(amountStr: string): number {
    // Remover símbolos de moneda, comas, espacios
    const cleaned = amountStr
      .replace(/[$€£¥,\s]/g, '')
      .replace(/[()]/g, '-') // Paréntesis indica negativo
      .trim();

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
  }

  /**
   * Extrae el nombre del comerciante de la descripción
   */
  private extractMerchantName(description: string): string {
    // Remover patrones comunes que no son nombres de comerciantes
    let cleaned = description
      .replace(/^(DEBIT|CREDIT|ACH|CHECK|TRANSFER|PAYMENT|WITHDRAWAL|DEPOSIT)\s*/i, '')
      .replace(/\d{4,}/g, '') // Remover números largos (fechas, referencias)
      .replace(/#\d+/g, '') // Remover números de referencia
      .trim();

    // Tomar las primeras palabras (usualmente el nombre del comerciante)
    const words = cleaned.split(/\s+/);
    return words.slice(0, 3).join(' ');
  }

  /**
   * Valida que el archivo tenga el formato esperado
   */
  validateFile(fileContent: string): { valid: boolean; error?: string } {
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return { valid: false, error: 'El archivo está vacío o no tiene suficientes datos' };
    }

    const headers = this.parseCSVLine(lines[0]);
    if (headers.length < 2) {
      return { valid: false, error: 'El archivo no tiene suficientes columnas' };
    }

    return { valid: true };
  }
}

export const fileImportService = new FileImportService();
export default fileImportService;
