const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, userRole, action, resource, resourceId, details = {}, ip = '') => {
  try {
    await AuditLog.create({
      userId,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress: ip,
      timestamp: new Date(),
    });
  } catch (err) {
    // Fail-safe: do not crash application if audit logger encounters DB glitch
    console.error('[AuditLogger Error]:', err.message);
  }
};

const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Proceed with route handler
    res.on('finish', () => {
      if (res.statusCode < 400) {
        const userId = req.user ? req.user._id : null;
        const userRole = req.user ? req.user.role : 'anonymous';
        const resourceId = req.params.id || '';
        const ip = req.ip || req.connection.remoteAddress || '';
        logAudit(userId, userRole, action, resource, resourceId, { method: req.method, path: req.originalUrl }, ip);
      }
    });
    next();
  };
};

module.exports = { logAudit, auditMiddleware };
