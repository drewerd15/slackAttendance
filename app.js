const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const { WebClient } = require("@slack/web-api");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

module.exports = app;

const web = new WebClient(process.env.SLACK_TOKEN);
app.post("/attendance", async (req, res, next) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const replyList = await web.conversations.replies({
      channel: payload.channel.id,
      ts: payload.message_ts,
    });
    let channelMembers = await web.conversations.members({
      channel: payload.channel.id,
    });
    const simpleList = [];
    replyList.messages.forEach((message) => {
      simpleList.push(message.user);
    });

    channelMembers.members = channelMembers.members.filter(
      (val) => !simpleList.includes(val)
    );
    channelMembers.members = [...new Set(channelMembers.members)]; //filters duplicates
    const emailList = [];
    await Promise.all(
      channelMembers.members.map(async (userId) => {
        const contents = await web.users.info({
          user: userId,
        });
        if (
          !contents.user.is_bot &&
          !contents.user.is_admin &&
          contents.user.profile.title === ""
        ) {
          emailList.push(contents.user.real_name);
        }
      })
    );
    await web.chat.postMessage({
      channel: payload.user.id,
      text:
        "Students who have not responded to the attendance thread: \n```" +
        emailList.join(`\n`) +
        "```",
    });

    res.sendStatus(200);
  } catch (e) {
    console.log("e", e);
  }
});
