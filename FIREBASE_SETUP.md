# 🔥 Configuración de Firebase

Esta guía te ayudará a configurar Firebase como base de datos para tu aplicación MLM Dashboard.

## 📋 Prerrequisitos

- Cuenta de Google
- Proyecto de Firebase creado

## 🚀 Pasos para Configurar Firebase

### 1. Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto" o "Add project"
3. Ingresa un nombre para tu proyecto (ej: `mlm-dashboard`)
4. Habilita Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 2. Configurar Firestore Database

1. En el panel izquierdo, haz clic en "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba" (para desarrollo)
4. Elige una ubicación para tu base de datos
5. Haz clic en "Siguiente" y luego "Habilitar"

### 3. Configurar la Aplicación Web

1. En el panel izquierdo, haz clic en el ícono de configuración (⚙️)
2. Selecciona "Configuración del proyecto"
3. Scroll hacia abajo hasta "Tus aplicaciones"
4. Haz clic en el ícono web (`</>`)
5. Ingresa un nombre para tu app (ej: `mlm-dashboard-web`)
6. **NO** marques "También configura Firebase Hosting"
7. Haz clic en "Registrar app"
8. Copia la configuración que aparece

### 4. Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo `.env.local`
2. Copia el siguiente contenido y reemplaza con tus valores:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 5. Configurar Reglas de Firestore

1. Ve a "Firestore Database" → "Reglas"
2. Reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en "Publicar"

## 🔄 Migración de Datos

### Opción 1: Migrar desde localStorage

1. Ve a la página de **Configuración** en tu aplicación
2. En la sección "Migración de Datos", haz clic en **"Migrar"**
3. Esto transferirá todos tus datos actuales a Firebase

### Opción 2: Cargar Datos de Ejemplo

1. Ve a la página de **Configuración**
2. Haz clic en **"Cargar"** en la sección de datos de ejemplo
3. Esto cargará datos de demostración en Firebase

## 🎯 Características de Firebase

### ✅ Ventajas

- **Sincronización en tiempo real**: Los datos se actualizan automáticamente
- **Acceso desde múltiples dispositivos**: Tus datos están disponibles en cualquier lugar
- **Respaldo automático**: Tus datos están seguros en la nube
- **Escalabilidad**: Puede manejar grandes cantidades de datos
- **Gratuito**: Plan gratuito generoso para proyectos pequeños

### 🔒 Seguridad

- Todos los datos están encriptados
- Reglas de seguridad configurables
- Acceso controlado por usuario (cuando implementes autenticación)

## 🛠️ Uso en la Aplicación

### Hooks Inteligentes

La aplicación usa hooks "inteligentes" que automáticamente eligen el mejor proveedor de datos:

```typescript
import { 
  useSmartReferrals, 
  useSmartPersonalInvestments, 
  useSmartLeads, 
  useSmartDashboardMetrics 
} from '@/hooks';
```

### Cambio Automático

- Si Firebase está configurado → usa Firebase
- Si Firebase no está configurado → usa localStorage
- No necesitas cambiar código, funciona automáticamente

## 🚨 Solución de Problemas

### Error: "Firebase is not configured"

1. Verifica que el archivo `.env.local` existe
2. Asegúrate de que todas las variables están definidas
3. Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Permission denied"

1. Ve a Firestore → Reglas
2. Asegúrate de que las reglas permiten lectura/escritura
3. Publica las reglas

### Los datos no se sincronizan

1. Verifica tu conexión a internet
2. Revisa la consola del navegador para errores
3. Asegúrate de que Firebase está configurado correctamente

## 📱 Próximos Pasos

1. **Autenticación**: Implementar login de usuarios
2. **Reglas de Seguridad**: Configurar acceso por usuario
3. **Backup**: Configurar respaldos automáticos
4. **Monitoreo**: Usar Firebase Analytics

## 🆘 Soporte

Si tienes problemas:

1. Revisa la [documentación oficial de Firebase](https://firebase.google.com/docs)
2. Verifica la consola del navegador para errores
3. Asegúrate de que todas las variables de entorno están configuradas

---

¡Listo! Tu aplicación ahora usa Firebase como base de datos. 🎉
