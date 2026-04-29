const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const createTweetsTable = `
  CREATE TABLE IF NOT EXISTS tweets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 280),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

const createFollowerTable = `
  CREATE TABLE IF NOT EXISTS followers (
    follower_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, user_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

const createFeedTable = `
  CREATE TABLE IF NOT EXISTS feed (
    user_id BIGINT NOT NULL,
    tweet_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tweet_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id)
  );
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
  INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id
`;

const addFollower = `
  INSERT INTO followers (user_id, follower_id) VALUES ($1, $2)
`;

const addTweet = `
  INSERT INTO tweets (user_id, content) VALUES ($1, $2) RETURNING id
`;

const addFeedItem = `
  INSERT INTO feed (user_id, tweet_id) VALUES ($1, $2)
`;

const findFollowers = `
  SELECT follower_id FROM followers WHERE user_id = $1
`;

const findFollowing = `
  SELECT user_id FROM followers WHERE follower_id = $1
`;

const findFeedTweets = `
  SELECT tweets.content, users.username, tweets.created_at
  FROM feed
  INNER JOIN tweets ON tweets.id = feed.tweet_id
  INNER JOIN users ON tweets.user_id = users.id
  WHERE feed.user_id = $1
  ORDER BY tweets.created_at DESC
`;

module.exports = {
  createUserTable,
  findFollowers,
  findFollowing,
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
