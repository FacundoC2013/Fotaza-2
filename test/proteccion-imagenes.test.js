const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Sustituir modelos ANTES de importar Express: no se carga Sequelize ni dotenv.
const modelsPath = require.resolve("../src/models");
const dotenvPath = require.resolve("dotenv");
require.cache[dotenvPath] = { id: dotenvPath, filename: dotenvPath, loaded: true,
  exports: { config() {} } };

let estado = "activa";
let permiteEditar = true;
let escrituras = 0;
let idUsuarioLogin = 1;
let comentariosAbiertos = true;
const rutas = [
  "/uploads/imagenes/seed/paisajes-la-punta-1.jpg",
  "/uploads/imagenes/seed/arquitectura-buenos-aires-1.jpg",
];
const imagen = (id) => ({
  id_imagen: id, id_publicacion: 1, titulo: "Imagen de prueba",
  ruta_archivo: rutas[id - 1], licencia: id === 1 ? "sin_copyright" : "con_copyright",
  comentarios_abiertos: comentariosAbiertos, comentarios: [], valoraciones: [],
  publicacion: { id_usuario: 1, estado, permite_editar: permiteEditar },
  async save() { comentariosAbiertos = this.comentarios_abiertos; escrituras++; },
});
const publicacion = () => ({
  id_publicacion: 1, id_usuario: 1, titulo: "Publicación de prueba", estado,
  permite_editar: permiteEditar,
  fecha_creacion: new Date(), autor: { id_usuario: 1, nombre: "Autor", apellido: "Demo" },
  imagenes: [imagen(1), imagen(2)], etiquetas: [],
});
const instancia = (data) => ({ ...data, get() { return data; } });
const coincideEstado = (filtro) => typeof filtro === "string"
  ? estado === filtro : estado !== filtro[Op.ne];
const models = {
  Imagen: {
    async findOne({ where }) { const i = rutas.indexOf(where.ruta_archivo); return i < 0 ? null : imagen(i + 1); },
    async findByPk(id) { return id === 1 || id === 2 ? imagen(id) : null; },
  },
  Publicacion: {
    async findByPk() { return instancia(publicacion()); },
    async findAll({ where }) { return coincideEstado(where.estado) ? [instancia(publicacion())] : []; },
  },
  Usuario: {
    async findOne() { return { id_usuario: idUsuarioLogin, nombre: "Autor", apellido: "Demo",
      rol: { nombre: "usuario" }, contrasenia_hash: await bcrypt.hash("clave-test", 4) }; },
    async findByPk(id, options) { return instancia({ id_usuario: 1, nombre: "Autor", apellido: "Demo",
      publicaciones: coincideEstado(options.include[0].where.estado) ? [publicacion()] : [] }); },
  },
  Seguidor: { async count() { return 0; }, async findOne() { return null; },
    async findAll() { return [{ id_seguido: 1 }]; } },
  Comentario: { async create() { escrituras++; } },
  Valoracion: { async findOne() { return null; }, async create() { escrituras++; } },
};
require.cache[modelsPath] = { id: modelsPath, filename: modelsPath, loaded: true, exports: models };
const app = require("../src/app");

test("protección HTTP y renderizado sin base de datos", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const pedir = (url, options = {}) => fetch(base + url, { redirect: "manual", ...options });
  const verificar = async (url, status, options) => {
    const res = await pedir(url, options);
    assert.equal(res.status, status, url);
    return res;
  };

  await t.test("imagen pública seed, HEAD y CSS", async () => {
    const res = await verificar(rutas[0], 200);
    assert.match(res.headers.get("content-type"), /image\/jpeg/);
    assert.equal(res.headers.get("cache-control"), "private, no-store");
    assert.ok((await res.arrayBuffer()).byteLength > 0);
    await verificar(rutas[0], 200, { method: "HEAD" });
    await verificar("/css/styles.css", 200);
  });
  await t.test("copyright anónimo y caminos alternativos", async () => {
    await verificar(rutas[1], 403);
    await verificar(rutas[1], 403, { method: "HEAD" });
    await verificar("/uploads/imagenes/no-registrada.jpg", 404);
    await verificar("/uploads/imagenes/%2e%2e%2fseed/paisajes-la-punta-1.jpg", 404);
    await verificar("/uploads/imagenes/seed%5cpaisajes-la-punta-1.jpg", 404);
    await verificar("/public" + rutas[1], 404);
    await verificar("/css/../uploads/imagenes/seed/arquitectura-buenos-aires-1.jpg", 403);
  });
  let cookie;
  await t.test("login y acceso autenticado", async () => {
    const res = await verificar("/login", 302, { method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=demo&password=clave-test" });
    cookie = res.headers.get("set-cookie").split(";")[0];
    await verificar(rutas[1], 200, { headers: { Cookie: cookie } });
    await verificar(rutas[0], 200, { headers: { Cookie: cookie } });
  });
  await t.test("home, búsqueda, detalle y perfil renderizan para ambos visitantes", async () => {
    for (const headers of [{}, { Cookie: cookie }]) {
      for (const url of ["/", "/publicaciones/buscar?q=prueba", "/publicaciones/1", "/usuarios/1"]) {
        const res = await verificar(url, 200, { headers });
        const html = await res.text();
        assert.match(html, /<!DOCTYPE html>/i);
        if (!headers.Cookie) assert.ok(!html.includes(rutas[1]), url);
      }
    }
  });
  await t.test("autor conserva cierre, reapertura y comentario; valoración propia bloqueada", async () => {
    const options = { method: "POST", headers: { Cookie: cookie,
      "Content-Type": "application/x-www-form-urlencoded" } };
    await verificar("/imagenes/1/comentarios/estado", 302, options);
    assert.equal(comentariosAbiertos, false);
    await verificar("/imagenes/1/comentarios", 403, { ...options, body: "texto=Prueba" });
    await verificar("/imagenes/1/comentarios/estado", 302, options);
    assert.equal(comentariosAbiertos, true);
    await verificar("/imagenes/1/comentarios", 302, { ...options, body: "texto=Prueba" });
    const antes = escrituras;
    await verificar("/imagenes/1/valoraciones", 302, { ...options, body: "puntaje=5" });
    assert.equal(escrituras, antes);
  });
  await t.test("otro usuario valora pero no cambia comentarios; logout revoca acceso", async () => {
    idUsuarioLogin = 2;
    const login = await verificar("/login", 302, { method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=otro&password=clave-test" });
    const otraCookie = login.headers.get("set-cookie").split(";")[0];
    const options = { method: "POST", headers: { Cookie: otraCookie,
      "Content-Type": "application/x-www-form-urlencoded" } };
    let antes = escrituras;
    await verificar("/imagenes/1/comentarios/estado", 302, options);
    assert.equal(escrituras, antes);
    await verificar("/imagenes/1/valoraciones", 302, { ...options, body: "puntaje=5" });
    assert.equal(escrituras, antes + 1);
    await verificar(rutas[1], 200, { headers: { Cookie: otraCookie } });
    await verificar("/logout", 302, options);
    await verificar(rutas[1], 403, { headers: { Cookie: otraCookie } });
    await verificar("/imagenes/1/comentarios", 302, { method: "POST", body: "texto=Prueba" });
  });
  await t.test("bloqueo de edición no oculta ni impide interacción; copyright conserva permisos", async () => {
    permiteEditar = false;
    for (estado of ["activa", "bloqueada_por_denuncia"]) {
      for (const headers of [{}, { Cookie: cookie }]) {
        await verificar(rutas[0], 200, { headers });
        await verificar(rutas[1], headers.Cookie ? 200 : 403, { headers });
        for (const url of ["/", "/publicaciones/buscar?q=prueba", "/publicaciones/1", "/usuarios/1"]) {
          const res = await verificar(url, 200, { headers });
          assert.ok((await res.text()).includes("Publicación de prueba"), `${estado}: ${url}`);
        }
      }
      const feed = await verificar("/publicaciones/siguiendo", 200, { headers: { Cookie: cookie } });
      assert.ok((await feed.text()).includes("Publicación de prueba"));
      const options = { method: "POST", headers: { Cookie: cookie,
        "Content-Type": "application/x-www-form-urlencoded" } };
      const antes = escrituras;
      await verificar("/imagenes/1/comentarios", 302, { ...options, body: "texto=Prueba" });
      await verificar("/imagenes/1/comentarios/estado", 302, options);
      await verificar("/imagenes/1/comentarios/estado", 302, options);
      assert.equal(escrituras, antes + 3);
      const login = await verificar("/login", 302, { method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "email=otro&password=clave-test" });
      const otraCookie = login.headers.get("set-cookie").split(";")[0];
      await verificar("/imagenes/1/valoraciones", 302, { ...options,
        headers: { ...options.headers, Cookie: otraCookie }, body: "puntaje=5" });
      assert.equal(escrituras, antes + 4);
    }
  });
  await t.test("solo bajadas: sin archivos, detalle ni escrituras directas", async () => {
    const antes = escrituras;
    for (permiteEditar of [true, false]) {
      estado = "bajada";
      for (const headers of [{}, { Cookie: cookie }]) {
        await verificar(rutas[0], 404, { headers });
        await verificar(rutas[1], 404, { headers });
        await verificar("/publicaciones/1", 404, { headers });
        for (const url of ["/", "/publicaciones/buscar?q=prueba", "/usuarios/1"]) {
          const res = await verificar(url, 200, { headers });
          assert.ok(!(await res.text()).includes("Publicación de prueba"), url);
        }
      }
      for (const [url, body] of [["comentarios", "texto=Prueba"],
        ["valoraciones", "puntaje=5"], ["comentarios/estado", ""]]) {
        await verificar(`/imagenes/1/${url}`, 404, { method: "POST",
          headers: { Cookie: cookie, "Content-Type": "application/x-www-form-urlencoded" }, body });
      }
    }
    assert.equal(escrituras, antes);
  });
});
