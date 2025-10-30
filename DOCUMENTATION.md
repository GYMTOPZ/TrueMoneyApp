# TrueMoney App - Documentación Técnica

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Servicios](#servicios)
3. [Gestión de Estado](#gestión-de-estado)
4. [Componentes](#componentes)
5. [Flujo de Datos](#flujo-de-datos)
6. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Arquitectura General

TrueMoney sigue una arquitectura limpia y modular con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         UI Layer (Screens)          │
│  Dashboard, Transactions, Insights  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       State Management (Zustand)    │
│         useFinanceStore             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic (Services)      │
│  Intelligence, FileImport, Bank     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Layer (Types/Models)      │
│  Transaction, Account, Insight      │
└─────────────────────────────────────┘
```

---

## Servicios

### 1. FileImportService

**Ubicación**: `src/services/fileImportService.ts`

**Responsabilidad**: Importar y procesar archivos CSV de diferentes bancos.

#### Métodos Principales

##### `importCSV(fileContent: string, bankName?: string): Promise<ImportResult>`
Importa transacciones desde un archivo CSV.

**Parámetros**:
- `fileContent`: Contenido del archivo CSV como string
- `bankName` (opcional): Nombre del banco para usar el patrón específico

**Retorna**:
```typescript
{
  transactions: Transaction[],
  accountInfo?: Partial<BankAccount>,
  errors: string[]
}
```

**Ejemplo de uso**:
```typescript
const result = await fileImportService.importCSV(csvContent, 'chase');
result.transactions.forEach(tx => {
  addTransaction(tx);
});
```

##### `validateFile(fileContent: string): { valid: boolean; error?: string }`
Valida que el archivo tenga el formato correcto antes de importar.

#### Patrones de Bancos Soportados

El servicio incluye patrones predefinidos para:

| Banco | Identificador | Columnas Clave |
|-------|--------------|----------------|
| Bank of America | `bankOfAmerica` | Posted Date, Payee, Amount |
| Chase | `chase` | Posting Date, Description, Type, Amount |
| Wells Fargo | `wellsFargo` | Date, Description, Amount |
| Citi | `citi` | Date, Description, Debit, Credit |
| Capital One | `capitalOne` | Transaction Date, Description, Debit, Credit |
| American Express | `amex` | Date, Description, Amount, Card Member |

#### Agregar un Nuevo Banco

Para agregar soporte para un nuevo banco:

1. Agregar el patrón en `BANK_PATTERNS`:
```typescript
myBank: {
  name: 'My Bank',
  dateColumns: ['Transaction Date'],
  descriptionColumns: ['Description'],
  amountColumns: ['Amount'],
  typeColumn: null,
  accountColumns: ['Account'],
}
```

2. Agregar detección en `autoDetectBank()`:
```typescript
if (headerStr.includes('mybank') || headerStr.includes('unique_identifier')) {
  return BANK_PATTERNS.myBank;
}
```

---

### 2. IntelligenceService

**Ubicación**: `src/services/intelligenceService.ts`

**Responsabilidad**: Analizar transacciones y generar insights financieros inteligentes.

#### Métodos Principales

##### `generateInsights(transactions: Transaction[]): FinancialInsight[]`
Genera todos los insights basados en las transacciones.

**Tipos de Insights Generados**:
1. **Gastos Innecesarios**: Detecta compras pequeñas frecuentes, suscripciones no usadas
2. **Gastos Recurrentes**: Identifica pagos automáticos mensuales
3. **Gastos Inusuales**: Compara con meses anteriores para detectar anomalías
4. **Optimización de Presupuesto**: Sugiere aplicar regla 50/30/20
5. **Oportunidades de Ingreso**: Analiza variabilidad y consistencia de ingresos
6. **Patrones de Ingreso**: Detecta ingresos recurrentes

**Ejemplo**:
```typescript
const insights = intelligenceService.generateInsights(transactions);
insights.forEach(insight => {
  if (insight.priority === 'high') {
    console.log('Alerta:', insight.title);
  }
});
```

##### `categorizeTransaction(description: string, merchantName?: string): TransactionCategory`
Categoriza automáticamente una transacción basándose en palabras clave.

**Categorías**: food, transportation, entertainment, utilities, rent, healthcare, shopping, education, salary, investment, other

**Algoritmo**:
1. Convierte descripción y nombre del comerciante a minúsculas
2. Busca palabras clave específicas (ej: "netflix" → entertainment)
3. Retorna la categoría más apropiada

**Ejemplo**:
```typescript
const category = intelligenceService.categorizeTransaction(
  "STARBUCKS STORE #12345",
  "Starbucks"
); // Retorna: 'food'
```

#### Lógica de Detección

**Gastos Innecesarios**:
- Compras < $15 más de 15 veces al mes → Sugerencia de preparar comidas en casa
- Gastos en shopping > $500/mes → Advertencia de gasto excesivo
- Suscripciones recurrentes → Pregunta si realmente se usan

**Gastos Inusuales**:
- Compara gasto del mes actual vs promedio de últimos 2 meses
- Si actual > promedio * 1.5 → Genera alerta

**Regla 50/30/20**:
- 50% ingresos para necesidades
- 30% para deseos
- 20% para ahorros

---

### 3. BankService (Preparado para el Futuro)

**Ubicación**: `src/services/bankService.ts`

**Estado**: Implementación base lista para futuras integraciones con APIs bancarias.

**Métodos Preparados**:
- `authenticateOAuth()`: Autenticación OAuth2
- `refreshToken()`: Renovar tokens de acceso
- `getAccounts()`: Obtener cuentas del usuario
- `getTransactions()`: Obtener transacciones de una cuenta
- `syncAllAccounts()`: Sincronizar múltiples cuentas

**Nota**: Actualmente no se usa. Está preparado para cuando se implemente integración con Plaid, Open Banking, etc.

---

## Gestión de Estado

### useFinanceStore (Zustand)

**Ubicación**: `src/store/useFinanceStore.ts`

#### Estado Global

```typescript
{
  accounts: BankAccount[],
  transactions: Transaction[],
  budgets: Budget[],
  insights: FinancialInsight[],
  dailyBudget: DailyBudget | null,
  spendingPatterns: SpendingPattern[],
  incomePatterns: IncomePattern[],
  isLoading: boolean,
  error: string | null
}
```

#### Acciones Principales

##### Cuentas
- `addAccount(account)`: Agregar nueva cuenta
- `updateAccount(id, updates)`: Actualizar cuenta existente
- `removeAccount(id)`: Eliminar cuenta (también elimina sus transacciones)
- `syncAccount(id)`: Sincronizar con banco (futuro)

##### Transacciones
- `addTransaction(transaction)`: Agregar transacción
- `updateTransaction(id, updates)`: Actualizar transacción
- `removeTransaction(id)`: Eliminar transacción
- `fetchTransactions(accountId?)`: Cargar transacciones (futuro)

##### Análisis
- `generateInsights()`: Generar insights financieros
- `analyzeSpendingPatterns()`: Analizar patrones de gasto
- `analyzeIncomePatterns()`: Analizar patrones de ingreso
- `calculateDailyBudget()`: Calcular presupuesto disponible hoy

#### Ejemplo de Uso

```typescript
import { useFinanceStore } from '../store/useFinanceStore';

function MyComponent() {
  const {
    transactions,
    dailyBudget,
    addTransaction,
    calculateDailyBudget
  } = useFinanceStore();

  useEffect(() => {
    calculateDailyBudget();
  }, [transactions]);

  return (
    <View>
      {dailyBudget && (
        <Text>Disponible: ${dailyBudget.remaining}</Text>
      )}
    </View>
  );
}
```

---

## Componentes

### DailyBudgetCircle

**Ubicación**: `src/components/DailyBudgetCircle.tsx`

**Props**:
```typescript
interface DailyBudgetCircleProps {
  dailyBudget: DailyBudget;
}
```

**Funcionalidad**:
- Muestra un círculo SVG con progreso del gasto diario
- Colores dinámicos basados en porcentaje usado:
  - Verde: < 50%
  - Amarillo: 50-75%
  - Naranja: 75-100%
  - Rojo: > 100%
- Mensajes motivacionales/advertencia según el estado
- Muestra monto disponible, gastado y porcentaje

**Cálculos**:
```typescript
const progress = Math.min(dailyBudget.percentageUsed, 100);
const strokeDashoffset = circumference - (progress / 100) * circumference;
```

---

## Flujo de Datos

### Flujo de Importación

```
1. Usuario selecciona archivo CSV
         ↓
2. ImportScreen lee el contenido
         ↓
3. FileImportService.importCSV() procesa el CSV
         ↓
4. IntelligenceService.categorizeTransaction() categoriza
         ↓
5. useFinanceStore.addTransaction() guarda en estado
         ↓
6. useFinanceStore.analyzeSpendingPatterns() analiza
         ↓
7. useFinanceStore.calculateDailyBudget() calcula presupuesto
         ↓
8. DashboardScreen muestra resultados
```

### Flujo de Análisis

```
1. Transacciones en el store cambian
         ↓
2. DashboardScreen detecta cambio (useEffect)
         ↓
3. Ejecuta analyzeSpendingPatterns()
         ↓
4. Ejecuta analyzeIncomePatterns()
         ↓
5. Ejecuta calculateDailyBudget()
         ↓
6. Ejecuta generateInsights()
         ↓
7. UI se actualiza automáticamente (Zustand reactivo)
```

---

## Guía de Desarrollo

### Agregar una Nueva Pantalla

1. Crear archivo en `src/screens/`:
```typescript
// MyNewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

const MyNewScreen = () => {
  return (
    <View>
      <Text>My New Screen</Text>
    </View>
  );
};

export default MyNewScreen;
```

2. Agregar a la navegación en `src/navigation/AppNavigator.tsx`:
```typescript
import MyNewScreen from '../screens/MyNewScreen';

// En el Tab.Navigator:
<Tab.Screen name="MyNew" component={MyNewScreen} />
```

### Agregar un Nuevo Tipo de Insight

1. Agregar método en `IntelligenceService`:
```typescript
private detectMyNewPattern(transactions: Transaction[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // Lógica de detección aquí

  insights.push({
    id: `insight-mypattern-${Date.now()}`,
    type: 'suggestion',
    title: 'Mi Nueva Sugerencia',
    description: 'Descripción del insight',
    actionable: true,
    priority: 'medium',
    createdAt: new Date(),
  });

  return insights;
}
```

2. Llamar en `generateInsights()`:
```typescript
generateInsights(transactions: Transaction[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // Insights existentes...
  insights.push(...this.detectMyNewPattern(transactions));

  return insights;
}
```

### Agregar una Nueva Categoría

1. Actualizar tipo en `src/types/index.ts`:
```typescript
export type TransactionCategory =
  | 'food'
  | 'transportation'
  // ...
  | 'my_new_category';
```

2. Actualizar `categorizeTransaction()`:
```typescript
// En IntelligenceService
if (text.includes('keyword1') || text.includes('keyword2')) {
  return 'my_new_category';
}
```

3. Actualizar iconos y colores en `TransactionsScreen.tsx`:
```typescript
const icons: Record<TransactionCategory, string> = {
  // ...
  my_new_category: 'icon-name',
};

const colors: Record<TransactionCategory, string> = {
  // ...
  my_new_category: '#HEXCOLOR',
};
```

### Testing Local

```bash
# Instalar dependencias
npm install

# Limpiar cache
npm start -- --clear

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ver logs
npx react-native log-ios
npx react-native log-android
```

### Debugging

1. **React Native Debugger**:
```bash
npm install -g react-native-debugger
```

2. **Zustand DevTools**:
```typescript
import { devtools } from 'zustand/middleware';

export const useFinanceStore = create(
  devtools((set, get) => ({ /* ... */ }))
);
```

3. **Console Logs**:
```typescript
console.log('Debug:', { transactions, insights });
```

---

## Mejores Prácticas

### 1. Gestión de Estado
- ✅ Usar Zustand para estado global
- ✅ Mantener estado local con useState cuando sea apropiado
- ✅ No duplicar datos entre estado global y local

### 2. Servicios
- ✅ Mantener lógica de negocio fuera de componentes
- ✅ Servicios deben ser stateless (sin estado interno)
- ✅ Usar async/await para operaciones asíncronas

### 3. Componentes
- ✅ Componentes pequeños y reutilizables
- ✅ Props tipadas con TypeScript
- ✅ Usar React.memo para optimización cuando sea necesario

### 4. Performance
- ✅ Evitar cálculos pesados en render
- ✅ Usar useMemo y useCallback apropiadamente
- ✅ Virtualizar listas largas (FlatList)

### 5. Seguridad
- ✅ Nunca exponer credenciales en código
- ✅ Validar datos de entrada
- ✅ Sanitizar datos antes de mostrar

---

## Próximos Pasos de Desarrollo

1. **Persistencia de Datos**
   - Implementar AsyncStorage para guardar datos localmente
   - Agregar encriptación para datos sensibles

2. **Notificaciones**
   - Alertas cuando se excede presupuesto diario
   - Recordatorios de gastos recurrentes

3. **Gráficos y Visualizaciones**
   - Gráficos de línea para tendencias
   - Gráficos de torta para distribución por categoría

4. **Exportación**
   - Generar reportes PDF
   - Exportar a CSV/Excel

5. **Mejoras de IA**
   - Predicción de gastos futuros
   - Recomendaciones más personalizadas

---

## Soporte

Para preguntas o problemas:
- 📧 Email: [Tu email]
- 🐛 Issues: https://github.com/gymtopz/TrueMoneyApp/issues
- 📖 Wiki: https://github.com/gymtopz/TrueMoneyApp/wiki
