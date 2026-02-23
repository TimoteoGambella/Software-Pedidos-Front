# Sistema de Pedidos - Frontend

Frontend del sistema de pedidos construido con React + Vite, Tailwind CSS y otras tecnologías modernas.

## 🚀 Características

- **React 18** con Vite para desarrollo ultrarrápido
- **Tailwind CSS** para estilos modernos y responsivos
- **React Router DOM** para navegación
- **Autenticación JWT** con Context API
- **React Icons** para iconografía
- **React Spinners** para indicadores de carga
- **React Toastify** para notificaciones
- **Axios** para llamadas HTTP

## 📋 Requisitos Previos

- Node.js v16 o superior
- Backend corriendo en `http://localhost:3003` (o la URL configurada)

## 🛠️ Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## ⚙️ Configuración

### Variables de Entorno

El proyecto utiliza dos archivos de entorno:

- **`.env.development`** - Para desarrollo local
- **`.env.production`** - Para producción (build)

**IMPORTANTE**: Los archivos .env NO están en .gitignore porque se desplegarán en un VPS privado.

### Configurar URL del API

Actualiza `VITE_API_URL` en los archivos .env:

**`.env.development`**
```
VITE_API_URL=http://localhost:3003/api
```

**`.env.production`**
```
VITE_API_URL=https://tu-api-en-produccion.com/api
```

## 🚀 Ejecutar el Proyecto

### Modo Desarrollo
```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

### Build para Producción
```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

### Preview del Build
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
Software-Pedidos-Front/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Layout principal con sidebar
│   │   └── PrivateRoute.jsx    # Componente para rutas protegidas
│   ├── config/
│   │   └── api.js              # Configuración de Axios
│   ├── context/
│   │   └── AuthContext.jsx     # Context API para autenticación
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Register.jsx        # Página de registro
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   ├── Clients.jsx         # Gestión de clientes
│   │   ├── Orders.jsx          # Gestión de pedidos
│   │   └── Profile.jsx         # Perfil de usuario
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales con Tailwind
├── .env.development            # Variables de entorno (desarrollo)
├── .env.production             # Variables de entorno (producción)
├── index.html
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind
├── postcss.config.js           # Configuración de PostCSS
└── package.json
```

## 🎨 Características de UI

### Diseño Responsivo
- Sidebar colapsable en móviles
- Grid adaptativo para diferentes pantallas
- Overlay para menú móvil

### Componentes de Estilo
Clases personalizadas disponibles:
- `.btn` - Botón base
- `.btn-primary` - Botón primario azul
- `.btn-secondary` - Botón secundario gris
- `.btn-danger` - Botón de peligro rojo
- `.input` - Input estilizado
- `.card` - Tarjeta con sombra

### Paleta de Colores
El proyecto usa una paleta azul personalizada (primary-*):
- primary-50 a primary-900
- Configurado en `tailwind.config.js`

## 🔐 Autenticación

El sistema de autenticación usa:
- **Context API** (`AuthContext`)
- **localStorage** para persistir sesión
- **JWT tokens** en headers de Axios
- **Rutas protegidas** con `PrivateRoute`

### Flujo de Autenticación

1. Usuario hace login/register
2. Token JWT se guarda en localStorage
3. Token se incluye automáticamente en todas las peticiones (interceptor Axios)
4. Si el token expira/es inválido, se redirige al login

## 📄 Páginas

### Login / Register
- Diseño moderno con gradiente
- Validación de formularios
- Feedback visual con spinners y toasts

### Dashboard
- Estadísticas en tarjetas
- Tabla de pedidos recientes
- Iconos con colores distintivos

### Clientes
- Lista de clientes con búsqueda
- Modal para crear/editar
- Acciones de editar y eliminar

### Pedidos
- Lista completa de pedidos
- Crear pedidos con múltiples items
- Descargar Excel
- Enviar por email
- Estados visuales (pending, processing, completed, cancelled)

### Perfil
- Actualizar nombre y email
- Cambiar contraseña
- Información de cuenta

## 🔌 Integración con Backend

El frontend se comunica con el backend a través de:
- **Axios** configurado en `src/config/api.js`
- **Interceptors** para agregar tokens automáticamente
- **Manejo de errores** centralizado

## 📦 Dependencias Principales

- **react**: ^18.2.0
- **react-router-dom**: ^6.20.1
- **axios**: ^1.6.2
- **react-icons**: ^4.12.0
- **react-spinners**: ^0.13.8
- **react-toastify**: ^9.1.3
- **tailwindcss**: ^3.3.6
- **vite**: ^5.0.8

## 🎯 Próximos Pasos

1. Asegúrate de que el backend esté corriendo
2. Configura las variables de entorno
3. Ejecuta el frontend en modo desarrollo
4. Regístrate creando un usuario
5. Explora todas las funcionalidades

## 💡 Tips de Desarrollo

- Hot Module Replacement (HMR) está activado por defecto
- Los cambios en CSS se reflejan instantáneamente
- Usa las herramientas de desarrollo de React
- Revisa la consola del navegador para errores

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Servir archivos estáticos
Los archivos en `dist/` pueden ser servidos con:
- Nginx
- Apache
- Vercel
- Netlify
- Cualquier servicio de hosting estático

### Configuración de Nginx (ejemplo)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📝 Notas Importantes

- Los archivos .env NO están en .gitignore (se desplegarán en VPS privado)
- Todas las variables de entorno deben tener el prefijo `VITE_`
- El puerto por defecto de Vite es 5173
- Las rutas usan hash-based routing para compatibilidad

## 🐛 Troubleshooting

### Error de CORS
- Verifica que el backend tenga configurado tu URL en `ALLOWED_ORIGINS`
- Asegúrate de que el backend esté corriendo

### Token Inválido
- Limpia localStorage y vuelve a hacer login
- Verifica que el `JWT_SECRET` sea el mismo en backend

### Build Falla
- Verifica que todas las variables de entorno estén configuradas
- Ejecuta `npm install` nuevamente
- Limpia caché con `npm cache clean --force`
