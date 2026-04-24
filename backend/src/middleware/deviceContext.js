module.exports = function deviceContext(req, res, next) {
  const raw = req.header('X-Device-Id');
  const id = typeof raw === 'string' ? raw.trim() : '';
  req.deviceId = id.length > 0 ? id : null;
  next();
};
