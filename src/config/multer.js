const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/imagenes"));
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const nombreArchivo = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, nombreArchivo);
  },
});

function fileFilter(req, file, cb) {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imagenes JPG, PNG o WEBP."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;