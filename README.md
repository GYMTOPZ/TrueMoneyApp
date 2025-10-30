# TrueMoney App

**Tu asistente financiero inteligente**

TrueMoney es una aplicación móvil iOS/Android que te ayuda a tomar control de tus finanzas personales mediante análisis inteligente de tus movimientos bancarios.

## Características Principales

### 1. Importación de Archivos Bancarios
- Soporta archivos CSV de bancos populares:
  - Bank of America
  - Chase
  - Wells Fargo
  - Citi
  - Capital One
  - American Express
- Detección automática del formato del banco
- Procesamiento 100% local (tus datos no salen de tu dispositivo)

### 2. Visualización de Presupuesto Diario
- **Círculo visual interactivo** que muestra cuánto puedes gastar hoy
- Calcula automáticamente tu presupuesto diario basado en:
  - Ingresos mensuales promedio
  - Gastos actuales del mes
  - Días restantes en el mes
- Alertas visuales cuando te acercas o excedes tu límite

### 3. Análisis Inteligente de Gastos
- Detección de gastos innecesarios:
  - Compras pequeñas frecuentes
  - Suscripciones no utilizadas
  - Gastos excesivos por categoría
- Identificación de patrones de gasto
- Comparación con meses anteriores
- Detección de gastos inusuales

### 4. Sugerencias para Maximizar Ingresos
- Análisis de consistencia de ingresos
- Identificación de oportunidades de ingreso adicional
- Detección de patrones de ingresos recurrentes
- Sugerencias personalizadas basadas en tu situación

### 5. Categorización Automática
- Clasifica transacciones automáticamente en:
  - Comida
  - Transporte
  - Entretenimiento
  - Servicios
  - Renta
  - Salud
  - Compras
  - Educación
  - Salario
  - Inversión
  - Otros

### 6. Insights Personalizados
- Alertas de alta prioridad para gastos que requieren atención
- Sugerencias de optimización de presupuesto
- Recomendaciones basadas en la regla 50/30/20
- Mensajes motivacionales y logros

## Arquitectura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── DailyBudgetCircle.tsx   # Visualización circular del presupuesto
├── navigation/         # Configuración de navegación
│   └── AppNavigator.tsx
├── screens/           # Pantallas principales
│   ├── DashboardScreen.tsx     # Pantalla principal
│   ├── TransactionsScreen.tsx  # Lista de transacciones
│   ├── InsightsScreen.tsx      # Insights financieros
│   ├── AccountsScreen.tsx      # Gestión de cuentas
│   └── ImportScreen.tsx        # Importación de archivos
├── services/          # Lógica de negocio
│   ├── fileImportService.ts    # Importación de CSV
│   ├── intelligenceService.ts  # Motor de análisis
│   └── bankService.ts         # (Futuro) Integración con APIs
├── store/            # Gestión de estado (Zustand)
│   └── useFinanceStore.ts
├── types/            # Definiciones TypeScript
│   └── index.ts
└── utils/            # Utilidades generales
```

## Stack Tecnológico

- **React Native** con **Expo** - Framework multiplataforma
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación entre pantallas
- **Zustand** - Gestión de estado ligera y eficiente
- **React Native SVG** - Gráficos vectoriales para visualizaciones
- **date-fns** - Manipulación de fechas
- **Expo Document Picker** - Selección de archivos

## Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- npm o yarn
- Expo CLI
- iOS Simulator (Mac) o Android Emulator

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/gymtopz/TrueMoneyApp.git
cd TrueMoneyApp
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm start
```

4. **Ejecutar en dispositivo**
- Para iOS: Presiona `i` o ejecuta `npm run ios`
- Para Android: Presiona `a` o ejecuta `npm run android`
- Para Web: Presiona `w` o ejecuta `npm run web`

## Uso de la Aplicación

### 1. Importar Transacciones

1. Descarga tus transacciones desde tu banco en formato CSV
2. Abre la app y ve a la sección de importación
3. Selecciona tu banco de la lista
4. Elige el archivo CSV
5. La app procesará automáticamente las transacciones

### 2. Ver Tu Presupuesto Diario

El dashboard principal muestra:
- Un círculo grande con tu presupuesto disponible para hoy
- Cantidad gastada hoy
- Porcentaje usado
- Mensajes motivacionales o de alerta

### 3. Revisar Insights

En la pestaña de Insights encontrarás:
- Alertas de alta prioridad
- Sugerencias de ahorro
- Análisis de patrones de gasto
- Recomendaciones personalizadas

### 4. Gestionar Cuentas

En la pestaña de Cuentas puedes:
- Ver todas tus cuentas bancarias
- Ver el balance total
- Eliminar cuentas si es necesario

## Servicios Principales

### FileImportService
Maneja la importación de archivos CSV de diferentes bancos.

**Funcionalidades:**
- Parseo inteligente de CSV
- Detección automática del formato del banco
- Validación de datos
- Extracción de fecha, descripción y monto
- Manejo de diferentes formatos de fecha y moneda

### IntelligenceService
Motor de análisis financiero que genera insights.

**Capacidades:**
- Detecta gastos innecesarios
- Identifica suscripciones recurrentes
- Analiza patrones de gasto
- Detecta anomalías en gastos
- Sugiere optimizaciones de presupuesto
- Analiza oportunidades de ingreso
- Categoriza transacciones automáticamente

### FinanceStore (Zustand)
Gestión centralizada del estado de la aplicación.

**Estado:**
- Cuentas bancarias
- Transacciones
- Presupuestos
- Insights
- Patrones de gasto e ingreso
- Presupuesto diario

## Seguridad y Privacidad

- ✅ **Procesamiento Local**: Todos los datos se procesan en tu dispositivo
- ✅ **Sin Servidores**: No se envía información a servidores externos
- ✅ **Sin Credenciales**: No necesitas proporcionar contraseñas bancarias
- ✅ **Datos Encriptados**: (Futuro) Encriptación local de datos sensibles

## Roadmap

### Versión Actual (v1.0)
- ✅ Importación de CSV
- ✅ Visualización de presupuesto diario
- ✅ Análisis inteligente de gastos
- ✅ Categorización automática
- ✅ Insights personalizados

### Próximas Funcionalidades (v1.1)
- [ ] Exportar reportes en PDF
- [ ] Gráficos de tendencias mensuales
- [ ] Metas de ahorro
- [ ] Notificaciones push para alertas
- [ ] Soporte para múltiples monedas

### Futuro (v2.0)
- [ ] Integración opcional con APIs bancarias (Open Banking)
- [ ] Predicción de gastos con ML
- [ ] Recomendaciones de inversión
- [ ] Modo familia/compartido
- [ ] Widget de presupuesto diario

## Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

- **GitHub**: [@gymtopz](https://github.com/gymtopz)
- **Proyecto**: [TrueMoneyApp](https://github.com/gymtopz/TrueMoneyApp)

## Agradecimientos

- Inspirado en apps como Mint, YNAB y PocketGuard
- Iconos por [Ionicons](https://ionic.io/ionicons)
- Framework por [Expo](https://expo.dev)

---

**Nota**: Esta aplicación está en desarrollo activo. Si encuentras bugs o tienes sugerencias, por favor abre un issue en GitHub.
