const { Router } = require("express");
const { ObjectId, ObjectID } = require("mongodb");
const { getTable } = require("../dal");

const nodeMailer = require("nodemailer");

const router = Router();

let transporter = nodeMailer.createTransport({
  host: "host",
  port: 465,
  secure: true, //true for 465 port, false for other ports
  auth: {
    user: "user",
    pass: process.env.MAIL_SERVER_PASSWORD,
  },
});

const mailOptions = {
  from: '"text" <email>', // sender address
  to: "receivers", // list of receivers
  subject: "subject", // Subject line
  text: "text", // plain text body
  html: "<b>html</b>", // html body
};

router.get("/", async (req, res) => {
  res.send({ message: "hi" });
});

router.post("/new", async (req, res) => {
  await jobsCollection.insertOne({ ...req.body, status: "Review" });
  const newMailOptions = { ...mailOptions };
  newMailOptions.subject = `subject`;
  newMailOptions.text = `text`;
  newMailOptions.html = `html`;
  transporter.sendMail(newMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    res.send({ message: "success" });
  });
});

module.exports = router;
