# MLM Dashboard - Sistema de Gestión de Referidos Multinivel

Una aplicación web profesional para la gestión de referidos multinivel, desarrollada con Next.js 14, TypeScript, y Tailwind CSS.

## 🌟 Características

### Dashboard Principal
- **Métricas en tiempo real**: Inversiones totales, referidos activos, ganancias, vencimientos del día
- **Top 3 mejores referidos** con ranking visual
- **Alertas de vencimientos** para gestión proactiva
- **Resumen por generaciones** (Primera y Segunda generación)

### Gestión de Referidos
- **CRUD completo** para referidos de primera y segunda generación
- **Cálculos automáticos**: 24% ganancias del referido, 20% comisión del usuario
- **Filtros y búsqueda** avanzada por generación, estado, nombre y email
- **Tabla paginada** con información detallada de cada referido

### Análisis y Visualizaciones
- **Gráficos interactivos** con Recharts (líneas, barras, área, pie)
- **Proyecciones de crecimiento** a 3, 6 y 12 meses
- **Distribución por generaciones** con visualización tipo donut
- **Tendencias de ingresos** mensuales y anuales

### Gestión de Leads
- **Pipeline organizado** por estados: Interesados, En Duda, Rechazados
- **Vista en tarjetas** con información de contacto y notas
- **Cambio de estados** con botones de acción rápida
- **Seguimiento de fuentes** de cada lead

### Inversiones Personales
- **Historial completo** de inversiones con ciclos de 28 días
- **Cálculo automático** de ganancias del 24%
- **Resumen de performance** con ROI realizado
- **Proyecciones anuales** con reinversión compuesta

### Calculadoras Avanzadas
- **Calculadora de Inversión Personal**: Proyecciones con reinversión automática
- **Calculadora de Referidos**: Ingresos por múltiples grupos de referidos
- **Resultados detallados** con desglose por ciclos
- **Proyecciones a largo plazo** (3, 6, 12 meses)

## 🚀 Tecnologías

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS con tema personalizado
- **Gráficos**: Recharts para visualizaciones interactivas
- **Iconos**: Lucide React
- **Estado**: Custom React Hooks con localStorage
- **Utilidades**: date-fns, clsx, tailwind-merge

## 📊 Datos Pre-cargados

La aplicación incluye datos realistas basados en el Google Sheet analizado:

### Referidos Activos
- **27 referidos de primera generación** con inversiones entre €10,000 - €35,000
- **15 referidos de segunda generación** con inversiones entre €5,000 - €15,000
- **Fechas de vencimiento** distribuidas realísticamente
- **Cálculos automáticos** de ganancias e ingresos

### Leads Clasificados
- **10 leads interesados** con información de contacto completa
- **5 leads en duda** en proceso de decisión
- **7 leads rechazados** con historial de seguimiento
- **Fuentes diversas**: Instagram, WhatsApp, Referencias, LinkedIn, etc.

### Inversiones Personales
- **2 inversiones activas** con diferentes montos y fechas
- **Cálculos automáticos** de ganancias del 24%
- **Tracking de ciclos** completados

## 🛠 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Instalación Local
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd mlm-dashboard

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Scripts Disponibles
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run type-check # Verificación de tipos TypeScript
```

## 🌐 Despliegue en Vercel

### Opción 1: Deploy Automático desde GitHub

1. **Conectar repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Crea una cuenta o inicia sesión
   - Haz clic en "New Project"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `mlm-dashboard`

2. **Configuración automática**:
   - Vercel detectará automáticamente que es un proyecto Next.js
   - Las configuraciones están optimizadas en `vercel.json`
   - Haz clic en "Deploy"

3. **URL de producción**:
   - Recibirás una URL como `https://mlm-dashboard-xxx.vercel.app`
   - Cada push al repositorio desplegará automáticamente

### Opción 2: Deploy Manual con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Deploy desde el directorio del proyecto
vercel

# Para deploy de producción
vercel --prod
```

### Variables de Entorno (Opcional)

Si necesitas configurar variables de entorno:

```bash
# En Vercel Dashboard > Project > Settings > Environment Variables
NODE_ENV=production
```

## 📱 Características de la Aplicación

### Diseño Responsivo
- **Mobile-first**: Optimizado para todos los dispositivos
- **Breakpoints**: sm, md, lg, xl con Tailwind CSS
- **Navegación adaptativa**: Sidebar colapsable en móviles

### Performance
- **Next.js 14**: App Router para mejor rendimiento
- **Code Splitting**: Carga de componentes bajo demanda
- **Optimización automática**: Imágenes, fuentes, CSS

### Experiencia de Usuario
- **Estados de carga**: Indicadores visuales apropiados
- **Validación de formularios**: Feedback en tiempo real
- **Persistencia local**: Datos guardados en localStorage
- **Navegación intuitiva**: Breadcrumbs y estados activos

## 📊 Lógica de Negocio

### Cálculos Automáticos
- **Ganancias del referido**: 24% sobre su inversión cada 28 días
- **Ingreso del usuario**: 20% sobre las ganancias del referido (1ª gen), 10% (2ª gen)
- **Reinversión compuesta**: Las ganancias se suman al capital para el siguiente ciclo

### Ejemplo de Cálculo
```
Referido invierte €10,000
├── Ganancias del referido: €10,000 × 24% = €2,400
├── Ingreso usuario (1ª gen): €2,400 × 20% = €480
└── Ingreso usuario (2ª gen): €2,400 × 10% = €240
```

### Proyecciones
- **3 meses**: 3 ciclos completados
- **6 meses**: 6 ciclos completados  
- **12 meses**: 13 ciclos completados (año completo)

## 🔧 Estructura del Proyecto

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Rutas del dashboard
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── referrals/     # Gestión de referidos
│   │   ├── analytics/     # Análisis y gráficos
│   │   ├── leads/         # Gestión de leads
│   │   ├── investments/   # Inversiones personales
│   │   └── calculators/   # Calculadoras
│   ├── layout.tsx         # Layout raíz
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI básicos
│   ├── forms/            # Formularios
│   ├── charts/           # Componentes de gráficos
│   ├── calculators/      # Calculadoras especializadas
│   └── layout/           # Componentes de layout
├── hooks/                # Custom React Hooks
├── lib/                  # Utilidades y funciones
├── data/                 # Datos mock
└── types/                # Definiciones TypeScript
```

## 🎨 Temas y Estilos

### Paleta de Colores
- **Primary**: Azules (#0ea5e9, #0284c7, #0369a1)
- **Success**: Verdes (#22c55e, #16a34a, #15803d)
- **Warning**: Amarillos (#f59e0b, #d97706, #b45309)
- **Danger**: Rojos (#ef4444, #dc2626, #b91c1c)

### Componentes Personalizados
- **Botones**: `.btn`, `.btn-primary`, `.btn-secondary`
- **Tarjetas**: `.card` con sombras y bordes redondeados
- **Inputs**: `.input` con focus states
- **Badges**: `.badge` para estados y etiquetas
- **Tablas**: `.table` con hover states

## 📈 Funcionalidades Avanzadas

### Filtros y Búsqueda
- **Búsqueda en tiempo real** por nombre y email
- **Filtros combinables** por generación y estado
- **Paginación inteligente** con navegación

### Gestión de Estados
- **Referidos**: Activo, Completado, Expirado
- **Leads**: Interesado, En Duda, Rechazado
- **Inversiones**: Activa, Completada, Expirada

### Alertas y Notificaciones
- **Vencimientos del día** en dashboard
- **Métricas destacadas** con cambios porcentuales
- **Estados visuales** con colores diferenciados

## 🚀 Próximas Funcionalidades

### Mejoras Planificadas
- [ ] Sistema de autenticación
- [ ] Base de datos real (Supabase/Firebase)
- [ ] Notificaciones push
- [ ] Exportación a Excel/PDF
- [ ] Panel de administración
- [ ] API REST para móvil
- [ ] Integración con WhatsApp Business
- [ ] Reportes automáticos por email

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando las mejores prácticas de desarrollo web moderno.

### Soporte de Navegadores
- Chrome (recomendado)
- Firefox
- Safari
- Edge

### Compatibilidad
- Desktop: Windows, macOS, Linux
- Móvil: iOS 12+, Android 8+
- Tablet: iPad, Android tablets

---

**¿Necesitas ayuda?** Consulta la documentación de [Next.js](https://nextjs.org/docs) y [Tailwind CSS](https://tailwindcss.com/docs) para más detalles sobre las tecnologías utilizadas.