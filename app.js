"use strict";
var express_1 = require("express");
const {
  addTweet,
  addFeedEntry,
  findAllFollowers,
  findAllFollowing,
  getFeedTweets,
} = require("./service");
const {
  setupRedis,
  resetKey,
  createRedisKey,
  getJSON,
  setJSON,
} = require("./redis");
var app = express_1();
app.use(express_1.json());

app.get("/health", function (_, res) {
  res.send("ok");
});

async function injectFeed(userId, tweetId) {
  const followers = (await findAllFollowers(userId)) || [];

  // Invalidate each follower's cached feed when a new tweet arrives.
  await Promise.all(
    followers.map((followerId) => resetKey(createRedisKey(followerId))),
  );

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
    const redisKey = createRedisKey(userId);

    const cachedFeed = await getJSON(redisKey);
    if (cachedFeed) {
      return res.json(cachedFeed);
    }

    const feed = await getFeedTweets(userId);
    await setJSON(redisKey, feed);

    res.json(feed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/users/:userId/following", async function (req, res) {
  try {
    var userId = req.params.userId;
    const following = await findAllFollowing(userId);
    res.json(following);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function start() {
  try {
    await setupRedis();
  } catch (error) {
    console.error("Redis unavailable. Continuing without cache.", error.message);
  }

  app.listen(3000, function () {
    console.log("Server running on port 3000");
  });
}

start();
