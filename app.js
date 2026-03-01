"use strict";
var express_1 = require("express");
const {
  addTweet,
  addFeedEntry,
  findAllFollowers,
  getTweet,
  getFeedTweets,
} = require("./service");
var app = express_1();
app.use(express_1.json());

app.get("/health", function (_, res) {
  res.send("ok");
});

async function injectFeed(userId, tweetId) {
  const followers = (await findAllFollowers(userId)) || [];
  // Ensure we don't crash when a user has no followers, and wait for inserts.
  await Promise.all(
    followers.map((followerId) => addFeedEntry(tweetId, followerId)),
  );
}

app.post("/tweet", async function (req, res) {
  var userId = req.body.user_id;
  var content = req.body.content;
  const tweet = await addTweet(userId, content);

  await injectFeed(userId, tweet.id);

  res.status(200).json(tweet);
});

app.get("/feed/:userId", async function (req, res) {
  try {
    var userId = req.params.userId;
    const feed = await getFeedTweets(userId);

    res.json(feed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, function () {
  console.log("Server running on port 3000");
});
