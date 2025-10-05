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

# Bitnest — Dashboard de Gestión de Referidos (Next.js + TypeScript)

Aplicación web para la gestión y análisis de referidos e inversiones, construida con Next.js 14 (App Router), TypeScript y Tailwind CSS. Este repositorio contiene una interfaz administrativa para visualizar métricas, gestionar referidos, leads e inversiones, y generar proyecciones financieras sencillas.

## 🚀 Tecnologías principales

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Firebase (Firestore) como capa de datos en tiempo real
- Recharts para gráficos
- Lucide React para iconos

## ✅ Qué incluye este proyecto

- Dashboard con métricas agregadas (inversiones, referidos, ganancias, vencimientos)
- CRUD básico sobre Referidos, Inversiones Personales y Leads usando servicios sobre Firestore
- Hooks reutilizables (`src/hooks`) que encapsulan suscripciones y operaciones CRUD
- Utilidades de negocio en `src/lib/businessUtils.ts` (cálculos, métricas, filtros)
- Componentes UI reutilizables en `src/components` (cards, inputs, sidebar, charts)

## 🧭 Estructura relevante

- `src/app` — Rutas de la aplicación (App Router)
- `src/components` — Componentes UI compartidos
- `src/hooks` — Hooks para suscripciones y lógica de datos
- `src/lib` — Servicios de Firebase y utilidades de negocio
- `src/types` — Tipos TypeScript y constantes del negocio

## ⚙️ Requisitos y ejecución

Requiere Node.js 18+ y npm.

```bash
# instalar dependencias
npm install

# iniciar en modo desarrollo
npm run dev
```

Scripts principales (desde `package.json`):

- `dev` — servidor de desarrollo
- `build` — compilación para producción
- `start` — inicio del servidor en producción
- `lint` — ejecutar linter
- `type-check` — chequeo TypeScript

## 🔒 Variables de entorno

Configura las variables públicas de Firebase en `.env.local`:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (opcional)

## 🧩 Buenas prácticas y recomendaciones

- Mantener `NEXT_PUBLIC_*` para claves del lado cliente y variables secretas en el dashboard de hosting.
- Revisar `src/lib/firebaseService.ts` para adaptar reglas de seguridad o queries específicas.
- Añadir pruebas unitarias y E2E para las rutas críticas y utilidades de negocio antes de cambios masivos.

## 🛠️ Despliegue

El proyecto está preparado para despliegue en Vercel. Ajusta las variables de entorno en el panel del proyecto.

## � Notas del mantenimiento (útiles para futuros refactors)

- `src/lib/businessUtils.ts` concentra mucha lógica de negocio. Considerar mover funciones a módulos más pequeños por responsabilidad.
- `src/hooks/firebaseHooks.ts` tiene lógica parecida entre hooks; valorar extraer utilidades comunes para suscripciones y manejo de errores.

## ¿Necesitas ayuda? / Contribuir

Si quieres colaborar o necesitas soporte, abre un issue con el objetivo o bug que quieres abordar e incluye pasos para reproducirlo. Para PRs, sigue la convención de ramas `feature/*` o `fix/*`.

**Licencia**: MIT (ajusta según tu preferencia)

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

- **Búsqueda en tiempo real** por nombre
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
