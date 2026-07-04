# 🥗 NutriScanApp — FIT IA

Aplicación web para analizar el contenido nutricional de alimentos mediante fotografías, usando inteligencia artificial (Claude Vision de Anthropic).

---

## 📁 Estructura del proyecto

```
NutriScanApp/
│
├── frontend/                   ← Todo lo que ve el usuario
│   ├── login.html              ← Pantalla de inicio de sesión
│   ├── registro.html           ← Pantalla de crear cuenta
│   ├── dashboard.html          ← Pantalla principal con scanner y resumen
│   ├── meta.html               ← Pantalla para editar meta calórica
│   │
│   ├── css/
│   │   └── style.css           ← Estilos globales de toda la app
│   │
│   ├── js/
│   │   ├── login.js            ← Lógica del formulario de login
│   │   ├── registro.js         ← Lógica del formulario de registro
│   │   ├── dashboard.js        ← Lógica del dashboard (scanner + historial)
│   │   └── meta.js             ← Lógica de edición de meta calórica
│   │
│   └── img/
│       ├── logo-app.png        ← Logo de la app (cámara verde)
│       └── logo-empresa.png    ← Logo de Talento Tecnológico
│
├── backend/                    ← Servidor Node.js
│   ├── server.js               ← Punto de entrada, configura Express
│   │
│   ├── config/
│   │   └── db.js               ← Conexión a MySQL (pool de conexiones)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js   ← Verifica el token JWT en rutas protegidas
│   │
│   ├── routes/
│   │   ├── authRoutes.js       ← /api/auth/login  y  /api/auth/registro
│   │   ├── foodRoutes.js       ← /api/food/analizar  y  /api/food/historial
│   │   └── userRoutes.js       ← /api/user/perfil, /meta, /calorias-hoy
│   │
│   └── controllers/
│       ├── authController.js   ← Registro con bcrypt + Login con JWT
│       ├── foodController.js   ← Llama a Claude Vision, guarda en DB
│       └── userController.js   ← Perfil de usuario, meta calórica
│
├── database/
│   └── nutricion.sql           ← Script para crear las tablas en MySQL
│
├── uploads/                    ← Imágenes temporales (se crean al iniciar)
├── package.json                ← Dependencias del proyecto
├── .env                        ← Variables de entorno (no subir a Git)
└── README.md                   ← Este archivo
```

---

## 🚀 Instalación paso a paso

### 1. Requisitos previos
- [Node.js](https://nodejs.org) v18 o superior
- [MySQL](https://www.mysql.com) 8.0 o superior
- Cuenta en [Anthropic Console](https://console.anthropic.com) para obtener tu API Key

### 2. Clonar / descargar el proyecto
```bash
# Si usas Git:
git clone <url-del-repo>
cd NutriScanApp

# O simplemente abre la carpeta en VS Code
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Crear la base de datos
```bash
mysql -u root -p < database/nutricion.sql
```
Esto crea la base de datos `nutricion` con todas las tablas necesarias.

### 5. Configurar las variables de entorno
Edita el archivo `.env` con tus datos:
```
DB_PASSWORD=tu_contraseña_de_mysql
JWT_SECRET=una_clave_larga_y_aleatoria
ANTHROPIC_API_KEY=sk-ant-tu_api_key_aqui
```

### 6. Agregar los logos
Copia tus imágenes en:
```
frontend/img/logo-app.png       ← Logo de la cámara verde
frontend/img/logo-empresa.png   ← Logo de Talento Tecnológico
```

### 7. Iniciar el servidor
```bash
# Desarrollo (reinicia automáticamente al guardar cambios):
npm run dev

# Producción:
npm start
```

### 8. Abrir la app
Abre tu navegador en: **http://localhost:3000**

---

## 🔌 Endpoints de la API

| Método | Ruta                       | Auth | Descripción                        |
|--------|----------------------------|------|------------------------------------|
| POST   | /api/auth/registro         | No   | Crear nueva cuenta                 |
| POST   | /api/auth/login            | No   | Iniciar sesión (devuelve JWT)      |
| GET    | /api/user/perfil           | Sí   | Datos del usuario y meta calórica  |
| PUT    | /api/user/meta             | Sí   | Actualizar meta calórica           |
| GET    | /api/user/calorias-hoy     | Sí   | Total de kcal consumidas hoy       |
| POST   | /api/food/analizar         | Sí   | Analizar foto con Claude Vision    |
| GET    | /api/food/historial        | Sí   | Alimentos registrados hoy          |

**Auth = Sí** → incluir header: `Authorization: Bearer <token>`

---

## 🛠 Tecnologías usadas

| Capa       | Tecnología                         |
|------------|------------------------------------|
| Frontend   | HTML5, CSS3, JavaScript vanilla    |
| Backend    | Node.js, Express.js                |
| Base de datos | MySQL + mysql2                  |
| IA         | Claude Vision (Anthropic SDK)      |
| Auth       | JWT + bcryptjs                     |
| Uploads    | Multer                             |
