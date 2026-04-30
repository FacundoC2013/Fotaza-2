BEGIN;

DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS intereses_compra CASCADE;
DROP TABLE IF EXISTS coleccion_publicacion CASCADE;
DROP TABLE IF EXISTS colecciones CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS seguidores CASCADE;
DROP TABLE IF EXISTS denuncias_comentarios CASCADE;
DROP TABLE IF EXISTS denuncias_imagenes CASCADE;
DROP TABLE IF EXISTS valoraciones CASCADE;
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS publicacion_etiqueta CASCADE;
DROP TABLE IF EXISTS etiquetas CASCADE;
DROP TABLE IF EXISTS imagenes CASCADE;
DROP TABLE IF EXISTS publicaciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasenia_hash VARCHAR(255) NOT NULL,
    biografia TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuarios_estado
    CHECK (estado IN ('activo', 'inactivo'))
);

CREATE TABLE publicaciones (
    id_publicacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activa',
    permite_editar BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,

    CONSTRAINT chk_publicaciones_estado
    CHECK (estado IN ('activa', 'bloqueada_por_denuncia', 'bajada'))
);

CREATE TABLE imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_publicacion INTEGER NOT NULL REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    titulo VARCHAR(150),
    descripcion TEXT,
    ruta_archivo VARCHAR(255) NOT NULL,
    licencia VARCHAR(30) NOT NULL,
    marca_agua BOOLEAN NOT NULL DEFAULT FALSE,
    texto_marca_agua VARCHAR(100),
    comentarios_abiertos BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_imagenes_licencia
    CHECK (licencia IN ('con_copyright', 'sin_copyright'))
);

CREATE TABLE etiquetas (
    id_etiqueta SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE publicacion_etiqueta (
    id_publicacion INTEGER NOT NULL REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    id_etiqueta INTEGER NOT NULL REFERENCES etiquetas(id_etiqueta) ON DELETE CASCADE,

    PRIMARY KEY (id_publicacion, id_etiqueta)
);

CREATE TABLE comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_imagen INTEGER NOT NULL REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_comentarios_estado
    CHECK (estado IN ('activo', 'eliminado'))
);

CREATE TABLE valoraciones (
    id_valoracion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_imagen INTEGER NOT NULL REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
    puntaje INTEGER NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_valoraciones_usuario_imagen
    UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_valoraciones_puntaje
    CHECK (puntaje BETWEEN 1 AND 5)
);

CREATE TABLE denuncias_imagenes (
    id_denuncia_imagen SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_imagen INTEGER NOT NULL REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_denuncias_imagenes_usuario_imagen
    UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_denuncias_imagenes_estado
    CHECK (estado IN ('pendiente', 'desestimada', 'aceptada'))
);

CREATE TABLE denuncias_comentarios (
    id_denuncia_comentario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_comentario INTEGER NOT NULL REFERENCES comentarios(id_comentario) ON DELETE CASCADE,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_denuncias_comentarios_usuario_comentario
    UNIQUE (id_usuario, id_comentario),

    CONSTRAINT chk_denuncias_comentarios_estado
    CHECK (estado IN ('pendiente', 'desestimada', 'aceptada'))
);

CREATE TABLE seguidores (
    id_seguidor INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_seguido INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_seguidor, id_seguido),

    CONSTRAINT chk_seguidores_no_mismo_usuario
    CHECK (id_seguidor <> id_seguido)
);

CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario_receptor INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_usuario_generador INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    tipo VARCHAR(40) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_notificaciones_tipo
    CHECK (tipo IN ('comentario', 'valoracion', 'interes_compra', 'nuevo_seguidor'))
);

CREATE TABLE colecciones (
    id_coleccion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coleccion_publicacion (
    id_coleccion INTEGER NOT NULL REFERENCES colecciones(id_coleccion) ON DELETE CASCADE,
    id_publicacion INTEGER NOT NULL REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_coleccion, id_publicacion)
);

CREATE TABLE intereses_compra (
    id_interes SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_imagen INTEGER NOT NULL REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL DEFAULT 'abierto',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_intereses_compra_usuario_imagen
    UNIQUE (id_usuario, id_imagen),

    CONSTRAINT chk_intereses_compra_estado
    CHECK (estado IN ('abierto', 'cerrado', 'cancelado'))
);

CREATE TABLE mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_interes INTEGER NOT NULL REFERENCES intereses_compra(id_interes) ON DELETE CASCADE,
    id_usuario_emisor INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    texto TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE
);

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

COMMIT;