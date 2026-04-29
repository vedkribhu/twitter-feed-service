const { createClient } = require("redis");

let redisClient;
let redisReady = false;

function createRedisKey(userId) {
  return `user:${userId}:feed`;
}

async function setupRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (error) => {
    redisReady = false;
    console.error("Redis client error:", error.message);
  });

  await redisClient.connect();
  redisReady = true;
  console.log(`Redis connected at ${redisUrl}`);
}

function isRedisReady() {
  return Boolean(redisClient?.isOpen && redisReady);
}

async function setJSON(key, value, ttlSeconds = 60) {
  if (!isRedisReady()) {
    return false;
  }
  await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  return true;
}

async function getJSON(key) {
  if (!isRedisReady()) {
    return null;
  }
  const value = await redisClient.get(key);
  if (!value) {
    return null;
  }

  console.log('### redis hit', key)
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

async function resetKey(key) {
  if (!isRedisReady()) {
    return 0;
  }
  return redisClient.del(key);
}

async function destroy() {
  if (!redisClient?.isOpen) {
    return;
  }
  await redisClient.quit();
}

module.exports = {
  createRedisKey,
  destroy,
  getJSON,
  resetKey,
  setJSON,
  setupRedis,
};
