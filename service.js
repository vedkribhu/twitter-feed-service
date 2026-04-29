const {
  addTweet: addTweetQuery,
  addFeedItem,
  findFollowers,
  findFollowing,
  // findFeedTweetIds,
  // findTweetById,
  findFeedTweets,
} = require("./queries");
const { pool } = require("./db");

async function addTweet(userId, tweetContent) {
  const result = await pool.query(addTweetQuery, [userId, tweetContent]);
  return { status: "ok", id: result.rows[0].id };
}

async function findAllFollowers(userId) {
  const result = await pool.query(findFollowers, [userId]);
  return result.rows.map((r) => r.follower_id);
}

async function findAllFollowing(userId) {
  const result = await pool.query(findFollowing, [userId]);
  return result.rows.map((r) => r.user_id);
}

async function addFeedEntry(tweetId, userId) {
  await pool.query(addFeedItem, [userId, tweetId]);
  return { userId: userId, tweetId: tweetId };
}

// function getTweet(tweetId) {
//   return new Promise((resolve, reject) => {
//     db.get(findTweetById, [tweetId], function (error, row) {
//       if (error) {
//         reject(error);
//         return;
//       }
//       resolve(row);
//     });
//   });
// }

async function getFeedTweets(userId) {
  const result = await pool.query(findFeedTweets, [userId]);
  return result.rows.map((row) => ({
    content: row.content,
    createdAt: row.created_at,
    userName: row.username,
  }));
}

module.exports = {
  addTweet,
  addFeedEntry,
  findAllFollowers,
  findAllFollowing,
  // getTweet,
  getFeedTweets,
};
