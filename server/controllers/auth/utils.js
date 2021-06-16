const { getTable } = require("../../dal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const crypto = require("crypto");

function generatePasswordHash(password, uid) {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(
      password,
      Buffer.from(uid.toHexString(), "hex"),
      1000,
      64,
      "sha512",
      (err, hash) => (err ? reject(err) : resolve(hash))
    )
  );
}

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
  const { hash, passwordHash } = await getTable("passwords").findOne({
    userId,
  });
  if (passwordHash) {
    return (await generatePasswordHash(password, userId)).equals(
      passwordHash.buffer
    );
  } else {
    return bcrypt.compare(password, hash);
  }
};

module.exports = {
  signToken,
  verifyPasswordForUser,
  createHash,
};
