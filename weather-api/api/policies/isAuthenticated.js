module.exports = async function (req, res, proceed) {
  if (req.session.userId) {
    return proceed();
  }
  // not authenticated
  return res.status(401).json({ error: 'You are not permitted to perform this action. Please log in.' });
};
