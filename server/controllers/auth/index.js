const { Router } = require("express");
const { getTable, getClient } = require("../../dal");
const { signToken } = require("../../handlers");
const utils = require("./utils");

const router = Router();
const mongoClient = getClient();
const usersCollection = getTable("users");
const passwordsCollection = getTable("passwords");
const activityCollection = getTable("activity");

function usernameIsValid(username) {
  return /^[0-9a-zA-Z_.-]+$/.test(username);
}

let wrap =
  (fn) =>
  (...args) =>
    fn(...args).catch(args[2]);

router.post("/register", async (req, res, next) => {
  const { password, ...user } = req.body;

  if (!password) {
    res.status(403).send("User must have a password");
  }

  if (!usernameIsValid(req.body.username)) {
    res.send({
      error:
        "Username is invalid, spaces and special characters are not allowed",
    });
  }

  const session = mongoClient.startSession();
  try {
    const existingUsername = await usersCollection.findOne({
      username: req.body.username,
    });
    const existingEmail = await usersCollection.findOne({
      email: req.body.email,
    });
    if (existingUsername) {
      res.send({ error: "Username taken" });
    } else if (existingEmail) {
      res.send({ error: "Email taken" });
    } else {
      await session.withTransaction(async () => {
        const hash = await utils.createHash(password);
        const { insertedId: userId } = await usersCollection.insertOne(
          { ...user, createdDate: new Date() },
          {
            session,
          }
        );
        await passwordsCollection.insertOne({ userId, hash }, { session });
        user._id = userId;
      });
      const token = await signToken(user);
      await activityCollection.insertOne({
        activityLevel: "global",
        activityType: "newUser",
        sourceUser: user,
        date: new Date(),
      });
      res.status(200).send({ token, user });
    }
  } catch (e) {
    console.log(e);
    next(e);
  } finally {
    session.endSession();
  }
});

router.post(
  "/login",
  wrap(async (req, res) => {
    const { username, password } = req.body;
    const userUsername = await usersCollection.findOne({ username: username });
    const userEmail = await usersCollection.findOne({ email: username });

    if (!userUsername && !userEmail) {
      res.send({ error: "User does not exist" });
      return;
    }
    if (userUsername) {
      const doesMatch = await utils.verifyPasswordForUser(
        userUsername._id,
        password
      );
      if (!doesMatch) {
        res.send({ error: "Incorrect password" });
        return;
      }
      const token = await signToken(userUsername);
      res.status(200).send({ token, user: userUsername });
    } else if (userEmail) {
      const doesMatch = await utils.verifyPasswordForUser(
        userEmail._id,
        password
      );
      if (!doesMatch) {
        res.send({ error: "Incorrect password" });
        return;
      }
      const token = await signToken(userEmail);
      res.status(200).send({ token, user: userEmail });
    }
  })
);

module.exports = router;
