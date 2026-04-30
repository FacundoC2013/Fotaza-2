USE fotaza2;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM mensajes;
DELETE FROM intereses_compra;
DELETE FROM coleccion_publicacion;
DELETE FROM colecciones;
DELETE FROM notificaciones;
DELETE FROM seguidores;
DELETE FROM denuncias_comentarios;
DELETE FROM denuncias_imagenes;
DELETE FROM valoraciones;
DELETE FROM comentarios;
DELETE FROM publicacion_etiqueta;
DELETE FROM etiquetas;
DELETE FROM imagenes;
DELETE FROM publicaciones;
DELETE FROM usuarios;
DELETE FROM roles;

ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
ALTER TABLE publicaciones AUTO_INCREMENT = 1;
ALTER TABLE imagenes AUTO_INCREMENT = 1;
ALTER TABLE etiquetas AUTO_INCREMENT = 1;
ALTER TABLE comentarios AUTO_INCREMENT = 1;
ALTER TABLE valoraciones AUTO_INCREMENT = 1;
ALTER TABLE denuncias_imagenes AUTO_INCREMENT = 1;
ALTER TABLE denuncias_comentarios AUTO_INCREMENT = 1;
ALTER TABLE notificaciones AUTO_INCREMENT = 1;
ALTER TABLE colecciones AUTO_INCREMENT = 1;
ALTER TABLE intereses_compra AUTO_INCREMENT = 1;
ALTER TABLE mensajes AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'usuario', 'Usuario registrado de la aplicación'),
(2, 'validador', 'Usuario encargado de revisar contenido denunciado'),
(3, 'admin', 'Administrador general del sistema');

INSERT INTO usuarios (
    id_usuario,
    id_rol,
    nombre,
    apellido,
    email,
    contrasenia_hash,
    biografia,
    estado
) VALUES
(1, 3, 'Facundo', 'Calderon', 'facundo@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Me gusta la fotografía urbana, los paisajes y el desarrollo web.', 'activo'),
(2, 2, 'Jaquelina', 'Velazquez', 'jaquelina@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Validadora de contenido. Interesada en fotografía artística y paisajes.', 'activo'),
(3, 1, 'Candela', 'Garcia', 'candela@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Amante de las fotos de ciudad, arquitectura y momentos cotidianos.', 'activo'),
(4, 1, 'Apolo', 'Loco', 'apolo@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Usuario curioso. Le gustan las fotos raras, urbanas y espontáneas.', 'activo'),
(5, 1, 'Negra', 'Fotaza', 'negra@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Me gusta comentar fotos y guardar publicaciones que me inspiran.', 'activo'),
(6, 1, 'Valentin', 'Casas', 'valentin@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Fotógrafo aficionado. Me interesa el arte, la luz y la composición.', 'activo'),
(7, 1, 'Ezequiel', 'Velazquez', 'ezequiel@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Me gustan las fotos nocturnas y los paisajes de San Luis.', 'activo'),
(8, 1, 'Ruth', 'Velazquez', 'ruth@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Disfruto sacar fotos de viajes, naturaleza y arquitectura.', 'activo'),
(9, 1, 'Abril', 'Garcia', 'abril@fotaza.com', '$2b$10$cfpp5I945jX8fVe1GfmnrOV8pybY5qYDR92K8WYw587HhoLHep/Ge', 'Me interesa descubrir fotos nuevas y coleccionar ideas visuales.', 'activo');

INSERT INTO publicaciones (
    id_publicacion,
    id_usuario,
    titulo,
    descripcion,
    estado,
    permite_editar
) VALUES
(1, 1, 'Paisajes de La Punta', 'Una serie de fotos tomadas en La Punta, San Luis, mostrando el cielo, las sierras y espacios abiertos.', 'activa', TRUE),
(2, 3, 'Arquitectura de Buenos Aires', 'Fotografías urbanas de edificios, calles y detalles arquitectónicos de Buenos Aires.', 'activa', TRUE),
(3, 6, 'El arte de Momma', 'Una publicación inspirada en el arte, los colores y las composiciones visuales.', 'activa', TRUE),
(4, 7, 'Ciudad de noche', 'Fotos nocturnas con luces, calles y movimiento urbano.', 'activa', TRUE),
(5, 8, 'Paisajes de San Luis', 'Imágenes de naturaleza, sierras y rincones tranquilos de San Luis.', 'activa', TRUE);

INSERT INTO imagenes (
    id_imagen,
    id_publicacion,
    titulo,
    descripcion,
    ruta_archivo,
    licencia,
    marca_agua,
    texto_marca_agua,
    comentarios_abiertos
) VALUES
(1, 1, 'Sierras de La Punta', 'Vista abierta de las sierras y el cielo de La Punta.', '/uploads/imagenes/seed/paisajes-la-punta-1.jpg', 'sin_copyright', FALSE, NULL, TRUE),
(2, 1, 'Camino en La Punta', 'Camino con vista al paisaje puntano.', '/uploads/imagenes/seed/paisajes-la-punta-2.jpg', 'sin_copyright', FALSE, NULL, TRUE),
(3, 2, 'Edificio histórico', 'Detalle arquitectónico de Buenos Aires.', '/uploads/imagenes/seed/arquitectura-buenos-aires-1.jpg', 'con_copyright', TRUE, 'Candela Garcia', TRUE),
(4, 3, 'Momma colores', 'Imagen artística con composición de colores.', '/uploads/imagenes/seed/arte-momma-1.jpg', 'con_copyright', TRUE, 'Candela Garcia', TRUE),
(5, 4, 'Luces de ciudad', 'Fotografía nocturna de una ciudad iluminada.', '/uploads/imagenes/seed/ciudad-noche-1.jpg', 'sin_copyright', FALSE, NULL, TRUE),
(6, 5, 'Paisaje serrano', 'Paisaje natural de San Luis.', '/uploads/imagenes/seed/paisajes-san-luis-1.jpg', 'sin_copyright', FALSE, NULL, TRUE);

INSERT INTO etiquetas (id_etiqueta, nombre) VALUES
(1, 'paisaje'),
(2, 'san_luis'),
(3, 'la_punta'),
(4, 'arquitectura'),
(5, 'buenos_aires'),
(6, 'arte'),
(7, 'ciudad'),
(8, 'noche'),
(9, 'naturaleza'),
(10, 'urbano');

INSERT INTO publicacion_etiqueta (id_publicacion, id_etiqueta) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 9),
(2, 4),
(2, 5),
(2, 10),
(3, 6),
(4, 7),
(4, 8),
(4, 10),
(5, 1),
(5, 2),
(5, 9);

INSERT INTO comentarios (
    id_comentario,
    id_usuario,
    id_imagen,
    texto,
    estado
) VALUES
(1, 3, 1, 'me gusta el uso de la luz', 'activo'),
(2, 4, 1, 'hermoso paisaje', 'activo'),
(3, 5, 2, 'wow que bien se ve nuestra ciudad', 'activo'),
(4, 9, 3, 'esto es arte', 'activo'),
(5, 7, 4, 'con que camara fue sacada?', 'activo'),
(6, 8, 5, 'la foto de noche quedo tremenda', 'activo'),
(7, 2, 6, 'muy buena composición del paisaje', 'activo'),
(8, 6, 1, 'me encanta como salio el cielo', 'activo');

INSERT INTO valoraciones (
    id_valoracion,
    id_usuario,
    id_imagen,
    puntaje
) VALUES
(1, 2, 1, 5),
(2, 3, 1, 4),
(3, 4, 1, 5),
(4, 5, 2, 4),
(5, 7, 3, 5),
(6, 8, 3, 4),
(7, 9, 4, 5),
(8, 1, 5, 5),
(9, 3, 5, 4),
(10, 4, 6, 5);

INSERT INTO denuncias_imagenes (
    id_denuncia_imagen,
    id_usuario,
    id_imagen,
    motivo,
    descripcion,
    estado
) VALUES
(1, 5, 4, 'Posible contenido con copyright', 'Me parece haber visto esta imagen en otra página.', 'pendiente'),
(2, 4, 3, 'Uso de imagen protegida', 'No estoy seguro de que la imagen sea propia del usuario.', 'pendiente');

INSERT INTO denuncias_comentarios (
    id_denuncia_comentario,
    id_usuario,
    id_comentario,
    motivo,
    descripcion,
    estado
) VALUES
(1, 2, 6, 'Comentario fuera de lugar', 'El comentario no aporta demasiado a la publicación.', 'pendiente');

INSERT INTO seguidores (
    id_seguidor,
    id_seguido
) VALUES
(3, 1),
(4, 1),
(5, 1),
(1, 6),
(7, 8),
(8, 7),
(9, 3),
(2, 1);

INSERT INTO notificaciones (
    id_notificacion,
    id_usuario_receptor,
    id_usuario_generador,
    tipo,
    leida
) VALUES
(1, 1, 3, 'comentario', FALSE),
(2, 1, 4, 'valoracion', FALSE),
(3, 6, 9, 'valoracion', FALSE),
(4, 7, 8, 'nuevo_seguidor', TRUE),
(5, 8, 7, 'nuevo_seguidor', FALSE),
(6, 1, 5, 'interes_compra', FALSE);

INSERT INTO colecciones (
    id_coleccion,
    id_usuario,
    nombre,
    descripcion
) VALUES
(1, 3, 'Inspiración urbana', 'Publicaciones de ciudad y arquitectura que me gustan.'),
(2, 5, 'Paisajes favoritos', 'Fotos de naturaleza y paisajes para volver a ver.'),
(3, 9, 'Ideas para fotos', 'Colección de imágenes que sirven como referencia.');

INSERT INTO coleccion_publicacion (
    id_coleccion,
    id_publicacion
) VALUES
(1, 2),
(1, 4),
(2, 1),
(2, 5),
(3, 3),
(3, 4);

INSERT INTO intereses_compra (
    id_interes,
    id_usuario,
    id_imagen,
    estado
) VALUES
(1, 5, 1, 'abierto'),
(2, 7, 3, 'abierto'),
(3, 9, 4, 'abierto');

INSERT INTO mensajes (
    id_mensaje,
    id_interes,
    id_usuario_emisor,
    texto,
    leido
) VALUES
(1, 1, 5, 'Hola, me interesa esta imagen para usarla en un diseño.', FALSE),
(2, 1, 1, 'Hola, gracias por escribir. La imagen está disponible.', FALSE),
(3, 2, 7, 'Buenas, me interesa la foto de arquitectura. ¿La vendés?', FALSE),
(4, 2, 3, 'Sí, podemos hablarlo sin problema.', FALSE),
(5, 3, 9, 'Esto es arte, me interesa saber si la puedo usar.', FALSE),
(6, 3, 6, 'Sí, la imagen tiene copyright pero podemos llegar a un acuerdo.', FALSE);

COMMIT;

