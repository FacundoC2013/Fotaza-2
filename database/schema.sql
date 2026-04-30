CREATE DATABASE IF NOT EXISTS fotaza2
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fotaza2;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS intereses_compra;
DROP TABLE IF EXISTS coleccion_publicacion;
DROP TABLE IF EXISTS colecciones;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS seguidores;
DROP TABLE IF EXISTS denuncias_comentarios;
DROP TABLE IF EXISTS denuncias_imagenes;
DROP TABLE IF EXISTS valoraciones;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS publicacion_etiqueta;
DROP TABLE IF EXISTS etiquetas;
DROP TABLE IF EXISTS imagenes;
DROP TABLE IF EXISTS publicaciones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasenia_hash VARCHAR(255) NOT NULL,
    biografia TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol),

    CONSTRAINT chk_usuarios_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE publicaciones (
    id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activa',
    permite_editar BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL,

    CONSTRAINT fk_publicaciones_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT chk_publicaciones_estado
        CHECK (estado IN ('activa', 'bloqueada_por_denuncia', 'bajada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_publicacion INT NOT NULL,
    titulo VARCHAR(150),
    descripcion TEXT,
    ruta_archivo VARCHAR(255) NOT NULL,
    licencia VARCHAR(30) NOT NULL,
    marca_agua BOOLEAN NOT NULL DEFAULT FALSE,
    texto_marca_agua VARCHAR(100),
    comentarios_abiertos BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagenes_publicaciones
        FOREIGN KEY (id_publicacion)
        REFERENCES publicaciones(id_publicacion)
        ON DELETE CASCADE,

    CONSTRAINT chk_imagenes_licencia
        CHECK (licencia IN ('con_copyright', 'sin_copyright'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE etiquetas (
    id_etiqueta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE publicacion_etiqueta (
    id_publicacion INT NOT NULL,
    id_etiqueta INT NOT NULL,

    PRIMARY KEY (id_publicacion, id_etiqueta),

    CONSTRAINT fk_publicacion_etiqueta_publicaciones
        FOREIGN KEY (id_publicacion)
        REFERENCES publicaciones(id_publicacion)
        ON DELETE CASCADE,

    CONSTRAINT fk_publicacion_etiqueta_etiquetas
        FOREIGN KEY (id_etiqueta)
        REFERENCES etiquetas(id_etiqueta)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_imagen INT NOT NULL,
    texto TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comentarios_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_comentarios_imagenes
        FOREIGN KEY (id_imagen)
        REFERENCES imagenes(id_imagen)
        ON DELETE CASCADE,

    CONSTRAINT chk_comentarios_estado
        CHECK (estado IN ('activo', 'eliminado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE valoraciones (
    id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_imagen INT NOT NULL,
    puntaje INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_valoraciones_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_valoraciones_imagenes
        FOREIGN KEY (id_imagen)
        REFERENCES imagenes(id_imagen)
        ON DELETE CASCADE,

    CONSTRAINT uq_valoraciones_usuario_imagen
        UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_valoraciones_puntaje
        CHECK (puntaje BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE denuncias_imagenes (
    id_denuncia_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_imagen INT NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_denuncias_imagenes_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_denuncias_imagenes_imagenes
        FOREIGN KEY (id_imagen)
        REFERENCES imagenes(id_imagen)
        ON DELETE CASCADE,

    CONSTRAINT uq_denuncias_imagenes_usuario_imagen
        UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_denuncias_imagenes_estado
        CHECK (estado IN ('pendiente', 'desestimada', 'aceptada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE denuncias_comentarios (
    id_denuncia_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_comentario INT NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_denuncias_comentarios_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_denuncias_comentarios_comentarios
        FOREIGN KEY (id_comentario)
        REFERENCES comentarios(id_comentario)
        ON DELETE CASCADE,

    CONSTRAINT uq_denuncias_comentarios_usuario_comentario
        UNIQUE (id_usuario, id_comentario),

    CONSTRAINT chk_denuncias_comentarios_estado
        CHECK (estado IN ('pendiente', 'desestimada', 'aceptada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seguidores (
    id_seguidor INT NOT NULL,
    id_seguido INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_seguidor, id_seguido),

    CONSTRAINT fk_seguidores_seguidor
        FOREIGN KEY (id_seguidor)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_seguidores_seguido
        FOREIGN KEY (id_seguido)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_seguidores_no_mismo_usuario
        CHECK (id_seguidor <> id_seguido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_receptor INT NOT NULL,
    id_usuario_generador INT NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificaciones_receptor
        FOREIGN KEY (id_usuario_receptor)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_notificaciones_generador
        FOREIGN KEY (id_usuario_generador)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_notificaciones_tipo
        CHECK (tipo IN ('comentario', 'valoracion', 'interes_compra', 'nuevo_seguidor'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE colecciones (
    id_coleccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_colecciones_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coleccion_publicacion (
    id_coleccion INT NOT NULL,
    id_publicacion INT NOT NULL,
    fecha_agregado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_coleccion, id_publicacion),

    CONSTRAINT fk_coleccion_publicacion_colecciones
        FOREIGN KEY (id_coleccion)
        REFERENCES colecciones(id_coleccion)
        ON DELETE CASCADE,

    CONSTRAINT fk_coleccion_publicacion_publicaciones
        FOREIGN KEY (id_publicacion)
        REFERENCES publicaciones(id_publicacion)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE intereses_compra (
    id_interes INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_imagen INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'abierto',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_intereses_compra_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_intereses_compra_imagenes
        FOREIGN KEY (id_imagen)
        REFERENCES imagenes(id_imagen)
        ON DELETE CASCADE,

    CONSTRAINT uq_intereses_compra_usuario_imagen
        UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_intereses_compra_estado
        CHECK (estado IN ('abierto', 'cerrado', 'cancelado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mensajes (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_interes INT NOT NULL,
    id_usuario_emisor INT NOT NULL,
    texto TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_mensajes_intereses
        FOREIGN KEY (id_interes)
        REFERENCES intereses_compra(id_interes)
        ON DELETE CASCADE,

    CONSTRAINT fk_mensajes_usuarios
        FOREIGN KEY (id_usuario_emisor)
        REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_usuarios_id_rol ON usuarios(id_rol);
CREATE INDEX idx_publicaciones_id_usuario ON publicaciones(id_usuario);
CREATE INDEX idx_imagenes_id_publicacion ON imagenes(id_publicacion);
CREATE INDEX idx_comentarios_id_usuario ON comentarios(id_usuario);
CREATE INDEX idx_comentarios_id_imagen ON comentarios(id_imagen);
CREATE INDEX idx_valoraciones_id_imagen ON valoraciones(id_imagen);
CREATE INDEX idx_denuncias_imagenes_id_imagen ON denuncias_imagenes(id_imagen);
CREATE INDEX idx_denuncias_comentarios_id_comentario ON denuncias_comentarios(id_comentario);
CREATE INDEX idx_notificaciones_receptor ON notificaciones(id_usuario_receptor);
CREATE INDEX idx_colecciones_id_usuario ON colecciones(id_usuario);
CREATE INDEX idx_intereses_compra_id_imagen ON intereses_compra(id_imagen);
CREATE INDEX idx_mensajes_id_interes ON mensajes(id_interes);