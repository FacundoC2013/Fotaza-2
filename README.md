# Fotaza 2

Proyecto integrador de Programación Web II.

Fotaza 2 es una aplicación web para publicar, buscar, compartir y valorar fotografías. La plataforma permite que usuarios registrados creen publicaciones con imágenes, etiquetas y licencias, además de comentar, valorar y seguir a otros usuarios.

## Tecnologías utilizadas

* Node.js
* Express
* PUG
* MySQL
* Sequelize
* Express-session
* Multer
* Bcrypt
* Bootstrap
* CSS 

## Funcionalidades implementadas

### Autenticación

* Sistema de login con usuarios cargados en la base de datos.
* Manejo de sesión con `express-session`.
* Contraseñas protegidas con `bcrypt`.
* Restricción de acciones para usuarios no autenticados.
* Los usuarios anónimos solo pueden visualizar contenido público, es decir, imágenes sin copyright.

### Publicaciones e imágenes

* Creación de publicaciones con:

  * título;
  * descripción opcional;
  * imagen;
  * licencia;
  * etiquetas.
* Subida de imágenes mediante `Multer`.
* Definición de licencia para cada imagen:

  * sin copyright;
  * con copyright.
* Opción de marca de agua para imágenes con copyright.
* Visualización de publicaciones en home, detalle y perfiles.

### Buscador

* Buscador de publicaciones/imágenes.
* Búsqueda por texto.
* Filtro por licencia.
* Filtro por etiqueta.
* Orden por:

  * más recientes;
  * más antiguas;
  * título;
  * mejor valoradas.
* Los filtros pueden combinarse entre sí.

### Comentarios

* Los usuarios registrados pueden comentar imágenes.
* Los comentarios se muestran en el detalle de la publicación.
* El autor puede abrir o cerrar los comentarios de cada imagen.
* Si los comentarios están cerrados, se muestran los comentarios anteriores, pero no se permiten nuevos comentarios.

### Valoraciones

* Los usuarios registrados pueden valorar imágenes.
* Cada usuario puede valorar una imagen una sola vez.
* El autor no puede valorar sus propias imágenes.
* Se muestra el promedio de valoración.
* Se muestra la cantidad de votos.

### Seguimiento de usuarios

* Un usuario puede seguir o dejar de seguir a otro usuario.
* El sistema evita que un usuario se siga a sí mismo.
* El sistema evita seguir dos veces al mismo usuario.
* Cada perfil muestra:

  * cantidad de seguidores;
  * cantidad de usuarios seguidos.
* Existe una sección de publicaciones de usuarios seguidos.

## Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* MySQL

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/FacundoC2013/Fotaza-2.git
```

Entrar a la carpeta del proyecto:

```bash
cd Fotaza-2
```

Instalar dependencias:

```bash
npm install
```

## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base el archivo `.env.example`.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=fotaza2
DB_USER=root
DB_PASSWORD=TU_PASSWORD_LOCAL

SESSION_SECRET=CLAVE_SECRETA_DE_SESION
```

Aclaración: el valor de `DB_PASSWORD` debe coincidir con la contraseña local de MySQL de quien ejecute el proyecto.

## Inicialización de la base de datos

Ejecutar:

```bash
npm run db:init
```

Este comando crea la base de datos, genera las tablas necesarias y carga datos de prueba.

El script ejecuta los archivos SQL ubicados en la carpeta `database`:

* `schema.sql`
* `seed.sql`

## Ejecución del proyecto

Para iniciar la aplicación:

```bash
npm start
```

Luego ingresar en el navegador a:

```txt
http://localhost:3000
```

Para desarrollo también se puede usar:

```bash
npm run dev
```

## Usuarios de prueba

Todos los usuarios de prueba utilizan la contraseña:

```txt
123456
```

Usuarios disponibles:

```txt
facundo@fotaza.com
jaquelina@fotaza.com
candela@fotaza.com
apolo@fotaza.com
negra@fotaza.com
valentin@fotaza.com
ezequiel@fotaza.com
ruth@fotaza.com
abril@fotaza.com
```

## Aclaración sobre roles

La base de datos incluye una tabla de roles y usuarios asociados a esos roles para dejar preparada la estructura del sistema. En esta versión del proyecto, las funcionalidades implementadas para regularización se concentran en usuarios registrados comunes: crear publicaciones, buscar publicaciones/imágenes, comentar, valorar imágenes y seguir usuarios.

## Imágenes de prueba

Las imágenes utilizadas por los datos iniciales del proyecto se encuentran en:

```txt
src/public/uploads/imagenes/seed
```

Las imágenes subidas desde la aplicación se guardan dentro de la carpeta de uploads local. Para una versión productiva se podría reemplazar este almacenamiento por un servicio externo de imágenes.

## Estructura general del proyecto

```txt
Fotaza-2/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── scripts/
│   └── init-db.js
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── public/
│   ├── routes/
│   └── views/
├── .env.example
├── package.json
└── README.md
```

## Base de datos

El proyecto utiliza MySQL.

La base de datos incluye tablas para:

* roles;
* usuarios;
* publicaciones;
* imágenes;
* etiquetas;
* comentarios;
* valoraciones;
* seguidores;
* denuncias;
* notificaciones;
* colecciones;
* intereses de compra;
* mensajes.

La estructura fue diseñada con claves primarias, claves foráneas, restricciones `UNIQUE`, restricciones `CHECK` e índices para mejorar la integridad y organización de los datos.

## Funcionalidades principales para regularización

Esta versión permite probar los módulos principales solicitados para regularizar:

* creación de publicación;
* buscador de publicaciones/imágenes;
* módulo de comentarios;
* valoración de imágenes;
* seguimiento de usuarios.

## Enlaces del proyecto

- Repositorio GitHub: https://github.com/FacundoC2013/Fotaza-2
- Aplicación desplegada: https://fotaza-2-e7id.onrender.com

## Estado del proyecto

El proyecto se encuentra en una versión funcional para regularización, con los módulos principales implementados y datos de prueba cargados mediante el script de inicialización.
