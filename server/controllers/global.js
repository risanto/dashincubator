const { Router } = require("express");
const { ObjectID } = require("mongodb");
const { getTable } = require("../dal");
const { authHandlers } = require("../handlers");

const router = Router();
const activityCollection = getTable("activity");
const tasksCollection = getTable("tasks");
const bountiesCollection = getTable("bounties");
const notificationsCollection = getTable("notifications");

router.get(
  "/activity",
  ...authHandlers(async (req, res) => {
    const result = await activityCollection.find({}).toArray();
    res.send(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
  })
);

router.get(
  "/notifications",
  ...authHandlers(async (req, res) => {
    const result = await notificationsCollection
      .find({
        $or: [
          { "destinationUser._id": req.tokenPayload._id },
          { "destinationUser._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    res.send(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
  })
);

router.get(
  "/dashboard",
  ...authHandlers(async (req, res) => {
    const unpaidTasks = await tasksCollection
      .find({ status: "complete", isPaid: { $exists: false } })
      .toArray();
    const pendingAdminApproval = await tasksCollection
      .find({
        status: "pending",
        $or: [
          { "createdBy._id": req.tokenPayload._id },
          { "createdBy._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    let pendingJobs = [];
    const pendingJobAdminApproval = await tasksCollection
      .find({
        bountyType: "job",
        completions: { $exists: true, $not: { $size: 0 } },
        $or: [
          { "createdBy._id": req.tokenPayload._id },
          { "createdBy._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    for (let i = 0; i < pendingJobAdminApproval.length; i++) {
      for (let j = 0; j < pendingJobAdminApproval[i].completions.length; j++) {
        let newJob = { ...pendingJobAdminApproval[i] };
        delete newJob.reviews;
        delete newJob.completions;
        if (!pendingJobAdminApproval[i].completions[j].isPaid) {
          pendingJobs.push({
            ...newJob,
            ...pendingJobAdminApproval[i].completions[j],
          });
        }
      }
    }
    const pendingContributorCompletion = await tasksCollection
      .find({
        status: "open",
        $or: [
          { "assignee._id": req.tokenPayload._id },
          { "assignee._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    const pendingContributorModify = await tasksCollection
      .find({
        status: "modify",
        $or: [
          { "assignee._id": req.tokenPayload._id },
          { "assignee._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    const pendingConcepts = await bountiesCollection
      .find({ type: "concept", status: "review" })
      .toArray();
    const result = {
      unpaidTasks: req.tokenPayload.isSuperUser && unpaidTasks,
      pendingAdminApproval: req.tokenPayload.isAdmin && [
        ...pendingAdminApproval,
        ...pendingJobs,
      ],
      pendingContributorCompletion,
      pendingContributorModify,
      pendingConcepts: req.tokenPayload.isAdmin && pendingConcepts,
    };
    res.send(result);
  })
);

router.get(
  "/dashboard-count",
  ...authHandlers(async (req, res) => {
    const unpaidTasks = await tasksCollection
      .find({ status: "complete", isPaid: { $exists: false } })
      .count();
    const pendingAdminApproval = await tasksCollection
      .find({
        status: "pending",
        $or: [
          { "createdBy._id": req.tokenPayload._id },
          { "createdBy._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .count();
    let pendingJobs = [];
    const pendingJobAdminApproval = await tasksCollection
      .find({
        bountyType: "job",
        completions: { $exists: true, $not: { $size: 0 } },
        $or: [
          { "createdBy._id": req.tokenPayload._id },
          { "createdBy._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .toArray();
    for (let i = 0; i < pendingJobAdminApproval.length; i++) {
      for (let j = 0; j < pendingJobAdminApproval[i].completions.length; j++) {
        let newJob = { ...pendingJobAdminApproval[i] };
        delete newJob.reviews;
        delete newJob.completions;
        if (!pendingJobAdminApproval[i].completions[j].isPaid) {
          pendingJobs.push({
            ...newJob,
            ...pendingJobAdminApproval[i].completions[j],
          });
        }
      }
    }
    const pendingContributorCompletion = await tasksCollection
      .find({
        status: "open",
        $or: [
          { "assignee._id": req.tokenPayload._id },
          { "assignee._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .count();
    const pendingContributorModify = await tasksCollection
      .find({
        status: "modify",
        $or: [
          { "assignee._id": req.tokenPayload._id },
          { "assignee._id": ObjectID(req.tokenPayload._id) },
        ],
      })
      .count();
    const pendingConcepts = await bountiesCollection
      .find({ type: "concept", status: "review" })
      .count();
    const result = {
      unpaidTasks: req.tokenPayload.isSuperUser && unpaidTasks,
      pendingAdminApproval:
        req.tokenPayload.isAdmin && pendingAdminApproval + pendingJobs.length,
      pendingContributorCompletion,
      pendingContributorModify,
      pendingConcepts: req.tokenPayload.isAdmin && pendingConcepts,
    };
    res.send(result);
  })
);

module.exports = router;
