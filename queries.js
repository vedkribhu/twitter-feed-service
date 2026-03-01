const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const createTweetsTable = `
  CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL CHECK(length(content) <= 280),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

const createFollowerTable = `
  CREATE TABLE IF NOT EXISTS followers (
    follower_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, user_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

const createFeedTable = `
  CREATE TABLE IF NOT EXISTS feed (
    user_id INTEGER NOT NULL,
    tweet_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tweet_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id)
    )
  `;

// tweets table
//   1. user_id

// follower table:
//   1. user_id,
//   2. follower_id

// feed table
//   1. user_id
//   2. tweets_id

const createIndexes = [
  // tweets table
  `create index if not EXISTS tweets_user on tweets (user_id)`,
  // follower table
  `create index if not EXISTS follower_user on followers (user_id)`,
  `create index if not EXISTS follower_follower on followers (follower_id)`,
  // feed table
  `create index if not EXISTS feed_user on feed (user_id)`,
  `create index if not EXISTS feed_tweet on feed (tweet_id)`,
];

const addUser = `
  insert into users (id, username, email) values (?, ?, ?)
`;

const addFollower = `
  insert into followers (user_id, follower_id) values (?, ?)
  `;

const addTweet = `
  insert into tweets (id, user_id, content) values (?, ?, ?)
  `;

const addFeedItem = `
  insert into feed (user_id, tweet_id) values (?, ?)
  `;

const findFollowers = `
  select follower_id from followers where user_id = ?
  `;

const findFeedTweets = `
    select tweets.content, users.username, tweets.created_at from feed
    inner join tweets on tweets.id = feed.tweet_id
    inner join users on tweets.user_id = users.id
    where feed.user_id = ?
  `;

module.exports = {
  createUserTable,
  findFollowers,
  findFeedTweets,
  // findTweetById,
  createFollowerTable,
  createTweetsTable,
  createFeedTable,
  addUser,
  addFollower,
  addTweet,
  addFeedItem,
  createIndexes,
};
