const sqlite3 = require("sqlite3").verbose();
const {
  addTweet: addTweetQuery,
  addFeedItem,
  findFollowers,
  findFeedTweetIds,
  findTweetById,
} = require("./queries");

const db = new sqlite3.Database("./twitter.db");
db.run("PRAGMA foreign_keys = ON");

async function addTweet(userId, tweetContent) {
  return new Promise((resolve, reject) => {
    db.run(addTweetQuery, [null, userId, tweetContent], function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ status: "ok", id: this.lastID });
    });
  });
}

function findAllFollowers(userId) {
  return new Promise((resolve, reject) => {
    // SELECT queries must use `db.all` (or `db.get`). `db.run` doesn't return rows.
    db.all(findFollowers, [userId], function (error, rows) {
      if (error) {
        reject(error);
        return;
      }
      // Normalize to an array of follower ids.
      resolve((rows || []).map((r) => r.follower_id));
    });
  });
}

function addFeedEntry(tweetId, userId) {
  return new Promise((resolve, reject) => {
    db.run(addFeedItem, [userId, tweetId], function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ userId: userId, tweetId: tweetId });
    });
  });
}

function getTweet(tweetId) {
  return new Promise((resolve, reject) => {
    db.get(findTweetById, [tweetId], function (error, row) {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function getFeedTweets(userId) {
  return new Promise((resolve, reject) => {
    db.all(findFeedTweetIds, [userId], function (error, rows) {
      if (error) {
        reject(error);
        return;
      }
      resolve((rows || []).map((r) => r.tweet_id));
    });
  });
}

module.exports = {
  addTweet,
  addFeedEntry,
  findAllFollowers,
  getTweet,
  getFeedTweets,
};
