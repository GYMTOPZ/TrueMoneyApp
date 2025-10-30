# Contribuir a TrueMoney App

¡Gracias por tu interés en contribuir a TrueMoney! 🎉

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

## ¿Cómo Puedo Contribuir?

### Reportar Bugs

Los bugs se rastrean como [GitHub issues](https://github.com/gymtopz/TrueMoneyApp/issues).

Antes de crear un bug report, revisa la lista de issues existentes para evitar duplicados.

**Al reportar un bug, incluye**:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Versión de la app y dispositivo

**Ejemplo**:
```
**Descripción**
La app se cierra al intentar importar un archivo CSV de Chase.

**Pasos para Reproducir**
1. Abrir la pantalla de Import
2. Seleccionar banco "Chase"
3. Elegir archivo CSV
4. La app se cierra

**Esperado**
La app debería importar las transacciones.

**Actual**
La app se cierra sin mensaje de error.

**Entorno**
- Versión: 1.0.0
- Dispositivo: iPhone 14 Pro
- iOS: 17.0
```

### Sugerir Mejoras

Las sugerencias de mejoras también se rastrean como [GitHub issues](https://github.com/gymtopz/TrueMoneyApp/issues).

**Al sugerir una mejora, incluye**:
- Descripción clara de la funcionalidad
- ¿Por qué sería útil?
- Ejemplos de uso
- Mockups o wireframes si es posible

### Pull Requests

1. **Fork el repositorio**
2. **Crea tu branch** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Haz tus cambios** siguiendo las guías de estilo
4. **Escribe tests** si es aplicable
5. **Commit tus cambios** con mensajes descriptivos:
   ```bash
   git commit -m "Agregar soporte para banco XYZ"
   ```
6. **Push a tu fork**:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
7. **Abre un Pull Request**

### Guía de Estilo

#### TypeScript/JavaScript

- Usar TypeScript para todo el código
- Preferir `const` sobre `let`, evitar `var`
- Usar arrow functions cuando sea apropiado
- Nombrar variables y funciones de forma descriptiva

```typescript
// ✅ Bueno
const calculateMonthlyAverage = (transactions: Transaction[]): number => {
  // ...
};

// ❌ Malo
function calc(t: any) {
  // ...
}
```

#### React/React Native

- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Usar destructuring para props

```typescript
// ✅ Bueno
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
};

// ❌ Malo
const MyComponent = (props: any) => {
  return <TouchableOpacity onPress={props.onPress}><Text>{props.title}</Text></TouchableOpacity>;
};
```

#### Commits

Seguir el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción corta

Descripción más detallada si es necesario.
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos**:
```
feat(import): agregar soporte para Wells Fargo CSV
fix(dashboard): corregir cálculo de presupuesto diario
docs(readme): actualizar instrucciones de instalación
```

### Estructura de Directorios

Al agregar nuevos archivos, sigue esta estructura:

```
src/
├── components/       # Componentes reutilizables
├── navigation/      # Configuración de navegación
├── screens/        # Pantallas principales
├── services/       # Lógica de negocio
├── store/          # Gestión de estado
├── types/          # Tipos TypeScript
├── utils/          # Funciones utilitarias
└── constants/      # Constantes de la app
```

### Tests (Próximamente)

Actualmente el proyecto no tiene tests implementados, pero se planea agregar:

- Unit tests con Jest
- Component tests con React Native Testing Library
- E2E tests con Detox

Si quieres contribuir agregando tests, ¡serías de gran ayuda!

## Proceso de Revisión

1. Al menos un maintainer debe aprobar el PR
2. Todos los checks de CI deben pasar (cuando se implementen)
3. El código debe seguir las guías de estilo
4. Los commits deben tener mensajes descriptivos

## Prioridades de Desarrollo

Actualmente buscamos ayuda con:

### Alta Prioridad
- [ ] Implementar persistencia de datos (AsyncStorage)
- [ ] Agregar tests unitarios y de integración
- [ ] Mejorar categorización automática con ML
- [ ] Soporte para más bancos

### Media Prioridad
- [ ] Gráficos y visualizaciones
- [ ] Exportación de reportes (PDF)
- [ ] Notificaciones push
- [ ] Metas de ahorro

### Baja Prioridad
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Widget para iOS/Android
- [ ] Integración con APIs bancarias

## Recursos Útiles

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Docs](https://docs.expo.dev/)

## Preguntas

Si tienes preguntas, puedes:
- Abrir un [GitHub Issue](https://github.com/gymtopz/TrueMoneyApp/issues)
- Comentar en un PR existente
- Contactar a los maintainers

## Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la Licencia MIT.

---

¡Gracias por contribuir a TrueMoney! 💰✨
