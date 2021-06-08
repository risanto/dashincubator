const { getTable } = require("../../dal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");

const signToken = (obj) => {
  return new Promise((resolve, reject) => {
    jwt.sign(obj, config.jwtSecret, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(token);
    });
  });
};

const createHash = (password) => {
  return bcrypt.hash(password, config.bcryptSaltRounds);
};

const verifyPasswordForUser = async (userId, password) => {
  const { hash } = await getTable("passwords").findOne({ userId });
  return bcrypt.compare(password, hash);
};

module.exports = {
  signToken,
  verifyPasswordForUser,
  createHash,
};
