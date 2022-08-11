const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const { WebClient } = require("@slack/web-api");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

module.exports = app;

const web = new WebClient(process.env.SLACK_TOKEN);
console.log("process.env.SLACK_TOKEN", process.env.SLACK_TOKEN);
(async () => {
  try {
    // await web.chat.postMessage({
    //   channel: "#testy",
    //   text: "Well hi there",
    // });
  } catch (e) {
    console.log("error", e);
  }
})();
app.post("/attendance", async (req, res, next) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const replyList = await web.conversations.replies({
      channel: payload.channel.id,
      ts: payload.message_ts,
    });
    const simpleList = [];
    replyList.messages.forEach((message) => {
      simpleList.push(message.user);
    });
    const emailList = [];
    await Promise.all(
      simpleList.map(async (userId) => {
        const contents = await web.users.info({
          user: userId,
        });
        emailList.push(contents.user.profile.email);
        console.log(contents);
      })
    );
    console.log("payload", payload);
    // console.log("emailList", emailList);
    // const currentUser = await web.users.identity();
    await web.chat.postMessage({
      channel: payload.user.id,
      text: "```" + emailList.join(`\n`) + "```",
    });

    res.sendStatus(200);
  } catch (e) {
    console.log("e", e);
  }
});
app.get("/attendance", (req, res, next) => {
  // Find conversation ID using the conversations.list method
  async function findConversation(name) {
    try {
      // Call the conversations.list method using the built-in WebClient
      const result = await web.conversations.list();

      for (const channel of result.channels) {
        if (channel.name === name) {
          conversationId = channel.id;

          // Print result
          console.log("Found conversation ID: " + conversationId);
          // Break from for loop
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  findConversation("testy");
  console.log("hello");
});
