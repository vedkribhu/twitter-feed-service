"use strict";

const {
  DEFAULT_CONFIG,
  injectFollowers,
  injectUsers,
  openDb,
} = require("./loadgen_utils");

function readNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function buildConfigFromEnv() {
  return {
    ...DEFAULT_CONFIG,
    userCount: readNumber(process.env.USER_COUNT, DEFAULT_CONFIG.userCount),
    startUserId: readNumber(process.env.START_USER_ID, DEFAULT_CONFIG.startUserId),
    avgFollowers: readNumber(process.env.AVG_FOLLOWERS, DEFAULT_CONFIG.avgFollowers),
    maxFollowers: readNumber(process.env.MAX_FOLLOWERS, DEFAULT_CONFIG.maxFollowers),
    heavyTailFraction: readNumber(
      process.env.HEAVY_TAIL_FRACTION,
      DEFAULT_CONFIG.heavyTailFraction,
    ),
    smallFollowerMax: readNumber(
      process.env.SMALL_FOLLOWER_MAX,
      DEFAULT_CONFIG.smallFollowerMax,
    ),
    paretoAlpha: readNumber(process.env.PARETO_ALPHA, DEFAULT_CONFIG.paretoAlpha),
    batchSize: readNumber(process.env.BATCH_SIZE, DEFAULT_CONFIG.batchSize),
    fakerSeed: readNumber(process.env.FAKER_SEED, DEFAULT_CONFIG.fakerSeed),
  };
}

async function run() {
  const config = buildConfigFromEnv();
  const db = openDb();

  try {
    const userIds = await injectUsers(db, config);
    const edgeCount = await injectFollowers(db, userIds, config);
    console.log(
      `Seeded ${userIds.length} users and ${edgeCount} follower edges.`,
    );
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("User/follower seeding failed:", error);
    process.exit(1);
  });
}
