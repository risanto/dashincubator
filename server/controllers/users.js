const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { getTable } = require("../dal");
const { authHandlers, signToken } = require("../handlers");

const router = Router();
const usersCollection = getTable("users");
const bountiesCollection = getTable("bounties");
const tasksCollection = getTable("tasks");
const activityCollection = getTable("activity");

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
