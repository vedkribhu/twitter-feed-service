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

const findFeedTweetIds = `
  select tweet_id from feed where user_id = ? order by created_at desc
  `;

const findTweetById = `
  select content from tweets where user_id = ?
  
  `;

module.exports = {
  createUserTable,
  findFollowers,
  findFeedTweetIds,
  findTweetById,
  createFollowerTable,
  createTweetsTable,
  createFeedTable,
  addUser,
  addFollower,
  addTweet,
  addFeedItem,
};
