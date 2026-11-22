# Mechanic SaaS


> **Estado del proyecto:** En desarrollo activo. La base del backend y la arquitectura principal están en construcción; la interfaz y varios flujos aún no están terminados.

![Vista previa de Mechanic Saas - Pantalla Admin ](https://imgur.com/OHa9kZn.png)
###### (Todos los datos mostrados en las pantallas son datos modals (datos para demostrar un prototipo visual), debido al desarrollo temprano del proyecto.)

## De qué trata

**Mechanic SaaS** es una aplicación web para la gestión operativa de talleres mecánicos. Su objetivo es centralizar el flujo diario del taller: registro de miembros, creación de órdenes de trabajo, revisión de presupuestos y seguimiento del estado de cada reparación.

El sistema trabaja con control de acceso por roles (`owner`, `admin`, `mechanic`, `customer`) para separar los permisos y responsabilidades de cada usuario dentro de la plataforma.

## Stack Tecnologico Actual

* **Frontend:** React, Tailwind CSS
* **Backend:** Node.js, Express
* **Base de datos:** PostgreSQL
* **Autenticación:** JWT y control de acceso basado en roles (RBAC)

## Avance actual

* Autenticación con JWT y validación de permisos por rol.
* Esquema relacional en PostgreSQL.
* Endpoints REST para gestión de miembros, órdenes de trabajo y presupuestos.
* Interfaz web en React e integración con la API (en progreso).


## Correr el proyecto en local (No recomendado actualmente)

### Requisitos previos
* Node.js (v18 o superior)
* PostgreSQL

### Pasos de instalación

1. Clona el repositorio y entra a la carpeta del proyecto:
```bash
git clone [https://github.com/IAM908/mechanic-saas.git](https://github.com/IAM908/mechanic-saas.git)
cd mechanic-saas
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz tomando como referencia `.env.example` deberías ver algo así:
```env
PORT=3000
DATABASE_URL=postgres://usuario:password@localhost:5432/mechanic_saas
JWT_SECRET=tu_clave_secreta
```

(Reemplaza los campos con tus propias claves)

4. Crea la base de datos `mechanic_saas` en PostgreSQL y ejecuta el script de tablas ubicado en `database/schema.sql`.

5. Inicia el servidor en modo desarrollo:
```bash
npm run dev
```

Una vez levantado, puedes probar los endpoints actuales desde Postman o SoftUI en `http://localhost:3000`.
