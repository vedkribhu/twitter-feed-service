"use strict";

const { faker } = require("@faker-js/faker");
const { DEFAULT_CONFIG, postJson, randomInt } = require("./loadgen_utils");

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
    tweetRatePerSec: readNumber(
      process.env.TWEET_RATE_PER_SEC,
      DEFAULT_CONFIG.tweetRatePerSec,
    ),
    tweetDurationSec: readNumber(
      process.env.TWEET_DURATION_SEC,
      0,
    ),
    fakerSeed: readNumber(process.env.FAKER_SEED, DEFAULT_CONFIG.fakerSeed),
  };
}

function buildUserIds(count, startId) {
  const ids = [];
  for (let i = 0; i < count; i += 1) {
    ids.push(startId + i);
  }
  return ids;
}

async function run() {
  const config = buildConfigFromEnv();
  const userIds = buildUserIds(config.userCount, config.startUserId);
  const runForever = config.tweetDurationSec <= 0;
  faker.seed(config.fakerSeed);

  let running = true;
  process.on("SIGINT", () => {
    running = false;
    console.log("Stopping tweet injector...");
  });

  let second = 0;
  while (running && (runForever || second < config.tweetDurationSec)) {
    const tickStart = Date.now();
    const tasks = [];
    for (let i = 0; i < config.tweetRatePerSec; i += 1) {
      const userId = userIds[randomInt(0, userIds.length - 1)];
      const content = faker.lorem.sentence();
      tasks.push(postJson("/tweet", { user_id: userId, content }));
    }

    try {
      await Promise.all(tasks);
    } catch (error) {
      console.error("Tweet injection error:", error.message || error);
    }

    const elapsed = Date.now() - tickStart;
    if (elapsed > 1000) {
      console.log(`Lagging by ${elapsed - 1000}ms at second ${second + 1}`);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    }

    second += 1;
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Tweet injector failed:", error);
    process.exit(1);
  });
}
