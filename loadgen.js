"use strict";

const {
  DEFAULT_CONFIG,
  injectFollowers,
  injectUsers,
  openDb,
  simulateTweets,
} = require("./loadgen_utils");

async function run() {
  const config = { ...DEFAULT_CONFIG };
  const db = openDb();
  db.run("PRAGMA foreign_keys = ON");

  try {
    const userIds = await injectUsers(db, config);
    await injectFollowers(db, userIds, config);
    await simulateTweets(userIds, config);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Load generation failed:", error);
    process.exit(1);
  });
}

module.exports = { DEFAULT_CONFIG };
