function requireLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  next();
}

function requireAnonimo(req, res, next) {
  if (req.session.usuario) {
    return res.redirect("/");
  }

  next();
}

module.exports = {
  requireLogin,
  requireAnonimo,
};