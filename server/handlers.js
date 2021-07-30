const { sign, verify } = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const signToken = async (user) => {
  return sign(user, JWT_SECRET);
};

const verifyToken = async (token) => {
  let data;

  try {
    data = verify(token, JWT_SECRET);

    if (!data.type) {
      data.type = "user";
    }
  } catch (e) {
    const err = e;
    err.statusCode = 401;

    throw err;
  }

  return data;
};

const tokenDataHandler = (req, res, next) => {
  if (!req.token) {
    next();
    return;
  }

  verifyToken(req.token).then(
    (tokenPayload) => {
      req.tokenPayload = tokenPayload;
      next();
    },
    (orgErr) => {
      const err = new Error(orgErr.message);
      err.code = 401;
      next(err);
    }
  );
};

const requireToken = (req, res, next) => {
  if (!req.tokenPayload) {
    const err = new Error("User authorization is required");
    err.code = 401;

    next(err);
    return;
  }

  next();
};

const noAuthHandlers = (...handlers) => {
  return [].concat(handlers);
};

const authHandlers = (...handlers) => {
  return [requireToken].concat(handlers);
};

exports.tokenDataHandler = tokenDataHandler;

exports.noAuthHandlers = noAuthHandlers;

exports.authHandlers = authHandlers;

exports.signToken = signToken;

exports.verifyToken = verifyToken;
