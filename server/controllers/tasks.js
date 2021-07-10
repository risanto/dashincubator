const { Router } = require("express");
const { ObjectId, ObjectID } = require("mongodb");
const { getTable } = require("../dal");
const { authHandlers } = require("../handlers");

const router = Router();
const tasksCollection = getTable("tasks");
const activityCollection = getTable("activity");
const bountiesCollection = getTable("bounties");
const usersCollection = getTable("users");
const notificationsCollection = getTable("notifications");

router.get(
  "/get/:id",
  ...authHandlers(async (req, res) => {
    const result = await tasksCollection.findOne({
      _id: ObjectID(req.params.id),
    });
    res.send(result);
  })
);

router.get(
  "/get/:id/activity",
  ...authHandlers(async (req, res) => {
    const result = await activityCollection
      .find({
        taskID: ObjectID(req.params.id),
        activityLevel: "task",
      })
      .toArray();
    res.send(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
  })
);

router.put(
  "/get/:id/see-activity",
  ...authHandlers(async (req, res) => {
    // add username with time of view
    const newKey = `lastView.${req.tokenPayload.username}`;

    await activityCollection.updateMany(
      { taskID: ObjectID(req.params.id), activityLevel: "task" },
      { $set: { [newKey]: new Date() } }
    );
    res.send({ message: "success" });
  })
);

router.get(
  "/open",
  ...authHandlers(async (req, res) => {
    const result = await tasksCollection
      .aggregate([
        {
          $match: {
            status: "open",
          },
        },
        {
          $lookup: {
            from: "activity",
            let: { taskID: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$taskID", "$$taskID"] } } },
              { $sort: { date: -1 } },
            ],
            as: "comments",
          },
        },
        {
          $sort: {
            dateCreated: -1,
          },
        },
      ])
      .toArray();
    res.send(result);
  })
);

router.get(
  "/completed",
  ...authHandlers(async (req, res) => {
    let jobItems = [];
    const jobs = await tasksCollection
      .find({
        bountyType: "job",
        reviews: { $exists: true, $not: { $size: 0 } },
      })
      .toArray();
    for (let i = 0; i < jobs.length; i++) {
      for (let j = 0; j < jobs[i].reviews.length; j++) {
        let newJob = { ...jobs[i] };
        delete newJob.reviews;
        delete newJob.completions;
        jobItems.push({ ...newJob, ...jobs[i].reviews[j] });
      }
    }

    const approvedConcepts = await bountiesCollection
      .find({
        approvedDate: { $exists: true },
      })
      .project({ requests: 0, completions: 0, reviews: 0 })
      .toArray();

    approvedConcepts.map((item) => {
      item.bountyTitle = item.title;
      item.description = "Approved concept";
      item.approvedAdmin = item.approvedBy;
      item.taskType = "spec";
      item.approvedContributor = item.user;
      item.payout = 0.5;
      item.isConcept = true;
      item.isPaid = item.conceptPaid;
    });

    const result = await tasksCollection
      .find({
        status: "complete",
      })
      .project({ requests: 0, completions: 0, reviews: 0 })
      .toArray();
    const filteredResult = result.filter((item) => item.bountyType !== "job");
    res.send(
      [...filteredResult, ...jobItems, ...approvedConcepts].sort(
        (a, b) => new Date(b.approvedDate) - new Date(a.approvedDate)
      )
    );
  })
);

router.post(
  "/new",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const task = await tasksCollection.insertOne({
        bountyID: ObjectID(req.body.bountyID),
        ...req.body.task,
      });
      await activityCollection.insertOne({
        activityLevel: "task",
        activityType: "newTask",
        bountyTitle: req.body.task.bountyTitle,
        bountyType: req.body.task.bountyType,
        bountyDisplayURL: req.body.task.bountyDisplayURL,
        taskDescription: req.body.task.description,
        sourceUser: req.body.task.createdBy,
        taskID: ObjectID(task.ops[0]._id),
        bountyID: ObjectID(req.body.bountyID),
        date: new Date(),
      });
      if (req.body.task.assignee) {
        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "assignTask",
          bountyTitle: req.body.task.bountyTitle,
          bountyType: req.body.task.bountyType,
          bountyDisplayURL: req.body.task.bountyDisplayURL,
          taskDescription: req.body.task.description,
          sourceUser: req.body.task.createdBy,
          destinationUser: req.body.task.assignee,
          taskID: ObjectID(task.ops[0]._id),
          bountyID: ObjectID(req.body.bountyID),
          date: new Date(),
        });
        await activityCollection.insertOne({
          activityLevel: "task",
          activityType: "assignTask",
          bountyTitle: req.body.task.bountyTitle,
          bountyType: req.body.task.bountyType,
          bountyDisplayURL: req.body.task.bountyDisplayURL,
          taskDescription: req.body.task.description,
          sourceUser: req.body.task.createdBy,
          destinationUser: req.body.task.assignee,
          taskID: ObjectID(task.ops[0]._id),
          bountyID: ObjectID(req.body.bountyID),
          date: new Date(),
        });
      }
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/update",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const newData = { ...req.body };
      delete newData._id;
      const task = await tasksCollection.findOneAndUpdate(
        { _id: ObjectID(req.body._id) },
        { $set: { ...newData } },
        { returnOriginal: true }
      );
      if (
        (!task.value.assignee && req.body.assignee) ||
        (req.body.assignee &&
          task.value.assignee &&
          req.body.assignee.username !== task.value.assignee.username)
      ) {
        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "assignTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: task.value.createdBy,
          destinationUser: req.body.assignee,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        await activityCollection.insertOne({
          activityLevel: "task",
          activityType: "assignTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: task.value.createdBy,
          destinationUser: req.body.assignee,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
      }
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/request-to-reserve/:id",
  ...authHandlers(async (req, res) => {
    const task = await tasksCollection.findOneAndUpdate(
      { _id: ObjectID(req.params.id) },
      { $push: { requests: req.body } },
      { returnOriginal: false }
    );
    await notificationsCollection.insertOne({
      notificationLevel: "task",
      notificationType: "reserveTask",
      bountyTitle: task.value.bountyTitle,
      bountyType: task.value.bountyType,
      bountyDisplayURL: task.value.bountyDisplayURL,
      taskDescription: task.value.description,
      sourceUser: req.body,
      destinationUser: task.value.createdBy,
      taskID: ObjectID(task.value._id),
      bountyID: ObjectID(task.value.bountyID),
      date: new Date(),
    });
    await activityCollection.insertOne({
      activityLevel: "task",
      activityType: "reserveTask",
      bountyTitle: task.value.bountyTitle,
      bountyType: task.value.bountyType,
      bountyDisplayURL: task.value.bountyDisplayURL,
      taskDescription: task.value.description,
      sourceUser: req.body,
      destinationUser: task.value.createdBy,
      taskID: ObjectID(task.value._id),
      bountyID: ObjectID(task.value.bountyID),
      date: new Date(),
    });
    res.send({ message: "success" });
  })
);

router.put(
  "/request-to-modify/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const task = await tasksCollection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        {
          $set: { status: "modify" },
          $push: { reviews: { ...req.body, rid: new ObjectID() } },
        },
        { returnOriginal: false }
      );
      await notificationsCollection.insertOne({
        notificationLevel: "task",
        notificationType: "requestModifyTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.reviewUser,
        destinationUser: task.value.assignee,
        reviewComments: req.body.reviewComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      await activityCollection.insertOne({
        activityLevel: "task",
        activityType: "requestModifyTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.reviewUser,
        destinationUser: task.value.assignee,
        reviewComments: req.body.reviewComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/request-to-approve/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const newData = { ...req.body };
      delete newData._id;
      const task = await tasksCollection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: { ...newData, status: "complete" } },
        { returnOriginal: false }
      );
      await usersCollection.findOneAndUpdate(
        { _id: ObjectId(task.value.approvedContributor._id) },
        { $set: { isContributor: true } },
        { returnOriginal: false }
      );
      await notificationsCollection.insertOne({
        notificationLevel: "task",
        notificationType: "requestApproveTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.approvedAdmin,
        destinationUser: task.value.approvedContributor,
        payout: task.value.payout,
        reviewComments: req.body.approvedComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      await activityCollection.insertOne({
        activityLevel: "task",
        activityType: "requestApproveTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.approvedAdmin,
        destinationUser: task.value.approvedContributor,
        payout: task.value.payout,
        reviewComments: req.body.approvedComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/request-to-approve-job/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const newData = { ...req.body };
      delete newData._id;
      const task = await tasksCollection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $push: { reviews: { ...newData, rid: new ObjectID() } } },
        { returnOriginal: false }
      );
      await usersCollection.findOneAndUpdate(
        { _id: ObjectId(newData.approvedContributor._id) },
        { $set: { isContributor: true } },
        { returnOriginal: false }
      );
      await notificationsCollection.insertOne({
        notificationLevel: "task",
        notificationType: "requestApproveTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.approvedAdmin,
        destinationUser: req.body.approvedContributor,
        payout: task.value.payout,
        reviewComments: req.body.approvedComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      await activityCollection.insertOne({
        activityLevel: "task",
        activityType: "requestApproveTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.approvedAdmin,
        destinationUser: req.body.approvedContributor,
        payout: task.value.payout,
        reviewComments: req.body.approvedComments,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/payout-concept/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isSuperUser) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const concept = await bountiesCollection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: { ...req.body.data, conceptPaid: true } },
        { returnOriginal: false }
      );
      await notificationsCollection.insertOne({
        notificationLevel: "bounty",
        notificationType: "payoutConcept",
        bountyTitle: concept.value.title,
        bountyType: concept.value.type,
        bountyDisplayURL: concept.value.displayURL,
        sourceUser: concept.value.paidOutBy,
        destinationUser: concept.value.user,
        payout: 0.5,
        bountyID: ObjectID(concept.value._id),
        date: new Date(),
      });
      await notificationsCollection.insertOne({
        notificationLevel: "bounty",
        notificationType: "payoutConcept",
        bountyTitle: concept.value.title,
        bountyType: concept.value.type,
        bountyDisplayURL: concept.value.displayURL,
        sourceUser: concept.value.paidOutBy,
        destinationUser: concept.value.approvedBy,
        payout: 0.05,
        bountyID: ObjectID(concept.value._id),
        date: new Date(),
      });
      await activityCollection.insertOne({
        activityLevel: "bounty",
        activityType: "payoutConcept",
        bountyTitle: concept.value.title,
        bountyType: concept.value.type,
        bountyDisplayURL: concept.value.displayURL,
        sourceUser: concept.value.paidOutBy,
        destinationUser: concept.value.user,
        destinationUser2: concept.value.approvedBy,
        payout: 0.5,
        bountyID: ObjectID(concept.value._id),
        date: new Date(),
      });
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/payout/:id",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isSuperUser) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const taskResult = await tasksCollection.findOne({
        _id: ObjectID(req.params.id),
      });
      if (taskResult.bountyType === "job" && req.body.rid) {
        const task = await tasksCollection.findOneAndUpdate(
          {
            _id: ObjectID(req.params.id),
            "reviews.rid": ObjectID(req.body.rid),
          },
          {
            $set: {
              "reviews.$.isPaid": true,
              "reviews.$.contributorTransactionID":
                req.body.data.contributorTransactionID,
              "reviews.$.adminTransactionID": req.body.data.adminTransactionID,
              "reviews.$.paidOutBy": req.body.data.paidOutBy,
            },
          },
          { returnOriginal: false }
        );

        let review = task.value.reviews.find(
          (item) => item.rid.toString() === req.body.rid.toString()
        );

        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: review.paidOutBy,
          destinationUser: review.approvedContributor,
          completionSummary: review.approvedOutput,
          completionSourceURL: review.approvedSourceURL,
          completionDeployURL: review.approvedDeployURL,
          payout: task.value.payout,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: review.paidOutBy,
          destinationUser: review.approvedAdmin,
          completionSummary: review.approvedOutput,
          completionSourceURL: review.approvedSourceURL,
          completionDeployURL: review.approvedDeployURL,
          payout: task.value.payout * 0.1,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        await activityCollection.insertOne({
          activityLevel: "task",
          activityType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: review.paidOutBy,
          destinationUser: review.approvedContributor,
          destinationUser2: review.approvedAdmin,
          completionSummary: review.approvedOutput,
          completionSourceURL: review.approvedSourceURL,
          completionDeployURL: review.approvedDeployURL,
          payout: task.value.payout,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        res.send({ message: "success" });
      } else if (!req.body.rid) {
        const task = await tasksCollection.findOneAndUpdate(
          { _id: ObjectID(req.params.id) },
          { $set: { ...req.body.data, isPaid: true } },
          { returnOriginal: false }
        );
        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: task.value.paidOutBy,
          destinationUser: task.value.approvedContributor,
          completionSummary: task.value.approvedOutput,
          completionSourceURL: task.value.approvedSourceURL,
          completionDeployURL: task.value.approvedDeployURL,
          payout: task.value.payout,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        await notificationsCollection.insertOne({
          notificationLevel: "task",
          notificationType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: task.value.paidOutBy,
          destinationUser: task.value.approvedAdmin,
          completionSummary: task.value.approvedOutput,
          completionSourceURL: task.value.approvedSourceURL,
          completionDeployURL: task.value.approvedDeployURL,
          payout: task.value.payout * 0.1,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        await activityCollection.insertOne({
          activityLevel: "task",
          activityType: "payoutTask",
          bountyTitle: task.value.bountyTitle,
          bountyType: task.value.bountyType,
          bountyDisplayURL: task.value.bountyDisplayURL,
          taskDescription: task.value.description,
          sourceUser: task.value.paidOutBy,
          destinationUser: task.value.approvedContributor,
          destinationUser2: task.value.approvedAdmin,
          completionSummary: task.value.approvedOutput,
          completionSourceURL: task.value.approvedSourceURL,
          completionDeployURL: task.value.approvedDeployURL,
          payout: task.value.payout,
          taskID: ObjectID(task.value._id),
          bountyID: ObjectID(task.value.bountyID),
          date: new Date(),
        });
        res.send({ message: "success" });
      }
    }
  })
);

router.put(
  "/comment/:id",
  ...authHandlers(async (req, res) => {
    const commentID = new ObjectID();

    const task = await tasksCollection.findOne({
      _id: ObjectID(req.params.id),
    });

    const pattern = /\B@[a-z0-9_-]+/gi;
    const mentionedArray = req.body.comment.match(pattern);
    if (mentionedArray && mentionedArray.length > 0) {
      const mentionedUsers = await Promise.all(
        mentionedArray.map(async (result) => {
          const data = await usersCollection.findOne({
            username: result.replace("@", ""),
          });
          return data;
        })
      );
      await Promise.all(
        mentionedUsers.map(async (user) => {
          await notificationsCollection.insertOne({
            notificationLevel: "task",
            notificationType: "mentionTask",
            sourceUser: req.body.commentUser,
            destinationUser: user,
            bountyTitle: task.bountyTitle,
            bountyType: task.bountyType,
            bountyDisplayURL: task.bountyDisplayURL,
            taskDescription: task.description,
            comment: req.body.comment,
            commentID: commentID,
            taskID: ObjectID(task._id),
            bountyID: ObjectID(task.bountyID),
            date: new Date(),
          });
        })
      );
    }
    await activityCollection.insertOne({
      activityLevel: "task",
      activityType: "commentTask",
      bountyTitle: task.bountyTitle,
      bountyType: task.bountyType,
      bountyDisplayURL: task.bountyDisplayURL,
      taskDescription: task.description,
      sourceUser: req.body.commentUser,
      comment: req.body.comment,
      commentID: commentID,
      destinationUser: task.createdBy,
      taskID: ObjectID(task._id),
      bountyID: ObjectID(task.bountyID),
      date: new Date(),
    });
    res.send({ message: "success" });
  })
);

router.put(
  "/comment-edit/:id",
  ...authHandlers(async (req, res) => {
    await notificationsCollection.updateMany(
      { commentID: ObjectId(req.params.id) },
      { $set: { comment: req.body.comment } }
    );
    await activityCollection.updateMany(
      { commentID: ObjectId(req.params.id) },
      { $set: { comment: req.body.comment } }
    );
    res.send({ message: "success" });
  })
);

router.put(
  "/request-to-complete/:id",
  ...authHandlers(async (req, res) => {
    const completionID = new ObjectID();
    const origTask = await tasksCollection.findOne({
      _id: ObjectID(req.params.id),
    });
    if (origTask.status === "pending") {
      res.send({ error: "task is pending approval" });
    } else {
      const task = await tasksCollection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        {
          $set: { status: "pending" },
          $push: {
            completions: { ...req.body, cid: completionID },
          },
        },
        { returnOriginal: false }
      );
      await notificationsCollection.insertOne({
        notificationLevel: "task",
        notificationType: "requestCompleteTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.completionUser,
        destinationUser: task.value.createdBy,
        completionID: completionID,
        completionSummary: req.body.completionDescription,
        completionSourceURL: req.body.completionSourceURL,
        completionDeployURL: req.body.completionDeployURL,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      await activityCollection.insertOne({
        activityLevel: "task",
        activityType: "requestCompleteTask",
        bountyTitle: task.value.bountyTitle,
        bountyType: task.value.bountyType,
        bountyDisplayURL: task.value.bountyDisplayURL,
        taskDescription: task.value.description,
        sourceUser: req.body.completionUser,
        destinationUser: task.value.createdBy,
        completionID: completionID,
        completionSummary: req.body.completionDescription,
        completionSourceURL: req.body.completionSourceURL,
        completionDeployURL: req.body.completionDeployURL,
        taskID: ObjectID(task.value._id),
        bountyID: ObjectID(task.value.bountyID),
        date: new Date(),
      });
      res.send({ message: "success" });
    }
  })
);

router.put(
  "/request-to-complete-job/:id",
  ...authHandlers(async (req, res) => {
    const completionID = new ObjectID();
    const task = await tasksCollection.findOneAndUpdate(
      { _id: ObjectID(req.params.id) },
      {
        $push: {
          completions: { ...req.body, cid: completionID },
        },
      },
      { returnOriginal: false }
    );
    await notificationsCollection.insertOne({
      notificationLevel: "task",
      notificationType: "requestCompleteTask",
      bountyTitle: task.value.bountyTitle,
      bountyType: task.value.bountyType,
      bountyDisplayURL: task.value.bountyDisplayURL,
      taskDescription: task.value.description,
      sourceUser: req.body.completionUser,
      destinationUser: task.value.createdBy,
      completionID: completionID,
      completionSummary: req.body.completionDescription,
      completionSourceURL: req.body.completionSourceURL,
      completionDeployURL: req.body.completionDeployURL,
      taskID: ObjectID(task.value._id),
      bountyID: ObjectID(task.value.bountyID),
      date: new Date(),
    });
    await activityCollection.insertOne({
      activityLevel: "task",
      activityType: "requestCompleteTask",
      bountyTitle: task.value.bountyTitle,
      bountyType: task.value.bountyType,
      bountyDisplayURL: task.value.bountyDisplayURL,
      taskDescription: task.value.description,
      sourceUser: req.body.completionUser,
      destinationUser: task.value.createdBy,
      completionID: completionID,
      completionSummary: req.body.completionDescription,
      completionSourceURL: req.body.completionSourceURL,
      completionDeployURL: req.body.completionDeployURL,
      taskID: ObjectID(task.value._id),
      bountyID: ObjectID(task.value.bountyID),
      date: new Date(),
    });
    res.send({ message: "success" });
  })
);

module.exports = router;
