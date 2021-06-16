const { Router } = require("express");
const { ObjectId, Binary } = require("mongodb");
const { getTable } = require("../dal");
const { authHandlers, signToken } = require("../handlers");
const crypto = require("crypto");
const Schema = require("computed-types");

const router = Router();
const usersCollection = getTable("users");
const bountiesCollection = getTable("bounties");
const tasksCollection = getTable("tasks");
const activityCollection = getTable("activity");
const passwordsCollection = getTable("passwords");

const nodeMailer = require("nodemailer");

const BASE_URL = "https://dashincubatorapp.netlify.app";
const RESET_PASSWORD_DEFAULT_TIMEOUT = 4 * 3600e3;

let transporter = nodeMailer.createTransport({
  host: "smtppro.zoho.com",
  port: 465,
  secure: true, //true for 465 port, false for other ports
  auth: {
    user: "dee.aye.en@gmail.com",
    pass: process.env.MAIL_SERVER_PASSWORD,
  },
});

const mailOptions = {
  from: '"Dash Incubator" <admin@dashplatform.app>', // sender address
  to: "receivers", // list of receivers
  subject: "subject", // Subject line
  text: "text", // plain text body
  html: "<b>html</b>", // html body
};

function getResetPasswordHashCode(user, requestTime) {
  return crypto
    .createHash("sha512")
    .update(user._id.toHexString())
    .update(user.passwordHash?.buffer || "")
    .update(requestTime.getTime().toString())
    .digest()
    .toString("hex", 0, 16);
}

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

router.get(
  "/",
  ...authHandlers(async (req, res) => {
    usersCollection.find({}).toArray((err, users) => {
      res.send(users);
    });
  })
);

router.get(
  "/simple",
  ...authHandlers(async (req, res) => {
    usersCollection
      .find({})
      .project({
        username: 1,
        email: 1,
        _id: 1,
        color: 1,
        profileImage: 1,
      })
      .toArray((err, users) => {
        res.send(users);
      });
  })
);

router.get(
  "/admins",
  ...authHandlers(async (req, res) => {
    usersCollection
      .find({ isAdmin: true })
      .project({
        username: 1,
        email: 1,
        _id: 1,
        color: 1,
        profileImage: 1,
      })
      .toArray()
      .then((users) => res.send(users));
  })
);

router.get(
  "/admins/simple",
  ...authHandlers(async (req, res) => {
    usersCollection
      .find({ isAdmin: true })
      .project({
        username: 1,
        email: 1,
        _id: 1,
        color: 1,
        profileImage: 1,
      })
      .toArray()
      .then((users) => res.send(users));
  })
);

router.get(
  "/username/:username",
  ...authHandlers(async (req, res) => {
    const bounties = await bountiesCollection
      .find({ "user.username": req.params.username })
      .toArray();
    const tasks = await tasksCollection
      .find({ "assignee.username": req.params.username })
      .toArray();
    const activity = await activityCollection
      .find({
        $or: [
          { "sourceUser.username": req.params.username },
          { "destinationUser.username": req.params.username },
        ],
      })
      .toArray();
    usersCollection.findOne({ username: req.params.username }).then((user) => {
      if (user) {
        user.bounties = bounties.sort(
          (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
        );
        user.tasks = tasks.sort(
          (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
        );
        user.activity = activity.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        res.send(user);
      } else {
        res.send({ error: "User not found" });
      }
    });
  })
);

router.get(
  "/:id",
  ...authHandlers(async (req, res) => {
    usersCollection
      .findOne({ _id: ObjectId(req.params.id) })
      .then((user) => res.send(user));
  })
);

router.put(
  "/promote/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isSuperUser) {
      res.send({ error: "Insufficient permissions" });
    } else {
      await usersCollection.findOneAndUpdate(
        {
          $or: [{ _id: ObjectId(req.params.id) }, { _id: req.params.id }],
        },
        { $set: { isAdmin: true } }
      );
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/demote/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isSuperUser) {
      res.send({ error: "Insufficient permissions" });
    } else {
      await usersCollection.findOneAndUpdate(
        {
          $or: [{ _id: ObjectId(req.params.id) }, { _id: req.params.id }],
        },
        { $set: { isAdmin: false, isSuperUser: false } }
      );
      res.send({ message: "success" });
    }
  })
);

router.put("/reset-password/:email", async (req, res) => {
  const user = await usersCollection.findOne({ email: req.params.email });
  const requestTime = new Date();
  const hash = getResetPasswordHashCode(user, requestTime);
  const newMailOptions = { ...mailOptions };
  newMailOptions.subject = `Dash Incubator - Reset Password`;
  newMailOptions.to = req.params.email;
  newMailOptions.text = `Click here to reset your password: ${BASE_URL}/update-password/${
    user._id
  }-${encodeURIComponent(hash)}`;
  newMailOptions.html = `Click here to reset your password: ${BASE_URL}/update-password/${
    user._id
  }-${encodeURIComponent(hash)}`;

  const requestPasswordResetTimeoutAt = new Date(
    requestTime.getTime() + RESET_PASSWORD_DEFAULT_TIMEOUT
  );
  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        requestPasswordResetAt: requestTime,
        requestPasswordResetTimeoutAt,
      },
    }
  );

  transporter.sendMail(newMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    res.send({ message: "success" });
  });
});

router.post("/update-password/:id", async (req, res) => {
  const user = await usersCollection.findOne({ _id: ObjectId(req.params.id) });
  if (
    req.body.hashCode !==
    getResetPasswordHashCode(user, user.requestPasswordResetAt)
  ) {
    res.send({ error: "Invalid hash" });
  } else {
    const requestPasswordResetTimeoutAt =
      user.requestPasswordResetTimeoutAt ??
      new Date(
        user.requestPasswordResetAt.getTime() + RESET_PASSWORD_DEFAULT_TIMEOUT
      );

    const timeNow = Date.now();

    if (timeNow > requestPasswordResetTimeoutAt.getTime()) {
      res.send({ error: "Hash is no longer valid" });
    } else {
      const passwordHash = new Binary(
        await generatePasswordHash(req.body.password, user._id)
      );
      const passwordResult = await passwordsCollection.updateOne(
        { userId: user._id },
        {
          $set: {
            passwordHash: passwordHash,
          },
        }
      );
      const userResult = await usersCollection.updateOne(
        { _id: user._id },
        {
          $unset: {
            requestPasswordResetAt: 1,
            requestPasswordResetTimeoutAt: 1,
            legacyPasswordHash: 1,
          },
        }
      );
      res.send({ message: "success" });
    }
  }
});

router.put(
  "/:id",
  ...authHandlers(async (req, res) => {
    const newData = { ...req.body };
    delete newData._id;
    let token = null;
    let user = null;
    if (Object.values(newData).length > 0) {
      if (newData.profileImage) {
        await bountiesCollection.updateMany(
          { "user._id": req.params.id },
          { $set: { "user.profileImage": newData.profileImage } }
        );
        await bountiesCollection.updateMany(
          { "primaryAdmin._id": req.params.id },
          { $set: { "primaryAdmin.profileImage": newData.profileImage } }
        );
        await bountiesCollection.updateMany(
          { "secondaryAdmin._id": req.params.id },
          { $set: { "secondaryAdmin.profileImage": newData.profileImage } }
        );
        await bountiesCollection.updateMany(
          { "approvedBy._id": req.params.id },
          { $set: { "approvedBy.profileImage": newData.profileImage } }
        );
        await tasksCollection.updateMany(
          { "createdBy._id": req.params.id },
          { $set: { "createdBy.profileImage": newData.profileImage } }
        );
        await tasksCollection.updateMany(
          { "assignee._id": req.params.id },
          { $set: { "assignee.profileImage": newData.profileImage } }
        );
        await tasksCollection.updateMany(
          { "approvedAdmin._id": req.params.id },
          { $set: { "approvedAdmin.profileImage": newData.profileImage } }
        );
        await tasksCollection.updateMany(
          { "approvedContributor._id": req.params.id },
          { $set: { "approvedContributor.profileImage": newData.profileImage } }
        );
        await activityCollection.updateMany(
          { "sourceUser._id": req.params.id },
          { $set: { "sourceUser.profileImage": newData.profileImage } }
        );
        await activityCollection.updateMany(
          { "destinationUser._id": req.params.id },
          { $set: { "destinationUser.profileImage": newData.profileImage } }
        );
      }
      const newUser = await usersCollection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: { ...newData } },
        { returnOriginal: false }
      );
      token = await signToken(newUser.value);
      user = newUser.value;
    }
    res.send({ token, user });
  })
);

module.exports = router;
