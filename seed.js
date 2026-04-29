const {
  createFollowerTable,
  createTweetsTable,
  createUserTable,
  addUser,
  addFollower,
  addTweet,
  createFeedTable,
  createIndexes: createIndexesQueries,
} = require("./queries");
const { pool } = require("./db");

async function createTables() {
  await pool.query(createUserTable);
  await pool.query(createFollowerTable);
  await pool.query(createTweetsTable);
  await pool.query(createFeedTable);
}

async function insertUsers() {
  const userOne = await pool.query(addUser, ["mike shinoda", "mik.s@gmail.com"]);
  const userTwo = await pool.query(addUser, ["vedant", "vedanta.b@gmail.com"]);
  return [userOne.rows[0].id, userTwo.rows[0].id];
}

async function injectFollower(userId, followerId) {
  await pool.query(addFollower, [userId, followerId]);
}

async function injectTweet(userId) {
  await pool.query(addTweet, [userId, "Nice concert today. Good work crew!"]);
}

async function createIndexes() {
  for (const query of createIndexesQueries) {
    await pool.query(query);
  }
}

async function run() {
  try {
    await pool.query("BEGIN");
    await createTables();
    await createIndexes();

    // Uncomment to insert sample records.
    // const [userOneId, userTwoId] = await insertUsers();
    // await injectFollower(userOneId, userTwoId);
    // await injectTweet(userOneId);

    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
