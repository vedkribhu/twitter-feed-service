"use strict";

const http = require("http");
const { faker } = require("@faker-js/faker");
const { addUser, addFollower } = require("./queries");
const { pool } = require("./db");

const API_HOST = process.env.API_HOST || "127.0.0.1";
const API_PORT = Number(process.env.API_PORT || 3000);

const DEFAULT_CONFIG = {
  userCount: 40,
  startUserId: 1,
  avgFollowers: 6,
  maxFollowers: 25,
  heavyTailFraction: 0.1,
  smallFollowerMax: 5,
  paretoAlpha: 1.4,
  tweetRatePerSec: 3,
  tweetDurationSec: 10,
  batchSize: 100,
  fakerSeed: 1234,
};

function randomInt(min, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

function paretoSample(alpha, xm) {
  const u = Math.random();
  return xm / Math.pow(1 - u, 1 / alpha);
}

function scaleCountsToAvg(counts, targetAvg, maxFollowers) {
  const currentAvg =
    counts.reduce((sum, c) => sum + c, 0) / Math.max(1, counts.length);
  if (currentAvg === 0) {
    return counts;
  }
  const scale = targetAvg / currentAvg;
  return counts.map((c) => Math.min(maxFollowers, Math.round(c * scale)));
}

function sampleDistinctIds(pool, count, excludeId) {
  const available = pool.length - (excludeId ? 1 : 0);
  if (count <= 0 || available <= 0) {
    return [];
  }

  const target = Math.min(count, available);
  if (target > available / 2) {
    const copy = pool.filter((id) => id !== excludeId);
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i);
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy.slice(0, target);
  }

  const selected = new Set();
  while (selected.size < target) {
    const candidate = pool[randomInt(0, pool.length - 1)];
    if (candidate === excludeId) {
      continue;
    }
    selected.add(candidate);
  }
  return Array.from(selected);
}

function generateFollowerCounts(userCount, config) {
  const counts = new Array(userCount).fill(0);
  const heavyCount = Math.max(1, Math.floor(userCount * config.heavyTailFraction));
  const smallCount = Math.max(0, userCount - heavyCount);

  let heavyTotal = 0;
  for (let i = 0; i < heavyCount; i += 1) {
    const rank = i + 1;
    const base = config.maxFollowers / Math.pow(rank, config.paretoAlpha);
    const noise = paretoSample(config.paretoAlpha, 1);
    const raw = Math.max(1, Math.floor(base + noise));
    counts[i] = Math.min(config.maxFollowers, raw);
    heavyTotal += counts[i];
  }

  let smallTotal = 0;
  for (let i = heavyCount; i < userCount; i += 1) {
    const roll = Math.random();
    const count = roll < 0.7 ? 0 : randomInt(1, config.smallFollowerMax);
    counts[i] = count;
    smallTotal += count;
  }

  const targetTotal = config.avgFollowers * userCount;
  const remainingTarget = Math.max(0, targetTotal - heavyTotal);
  const scale =
    smallTotal > 0 ? Math.min(remainingTarget / smallTotal, 1) : 0;

  if (scale > 0) {
    for (let i = heavyCount; i < userCount; i += 1) {
      counts[i] = Math.min(
        config.smallFollowerMax,
        Math.round(counts[i] * scale),
      );
    }
  }

  for (let i = counts.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const temp = counts[i];
    counts[i] = counts[j];
    counts[j] = temp;
  }

  return counts;
}

function generateFollowerEdges(userIds, config) {
  const counts = generateFollowerCounts(userIds.length, config);
  const edges = [];

  for (let i = 0; i < userIds.length; i += 1) {
    const userId = userIds[i];
    const count = counts[i];
    const followers = sampleDistinctIds(userIds, count, userId);
    followers.forEach((followerId) => {
      edges.push({ user_id: userId, follower_id: followerId });
    });
  }

  return edges;
}

function buildUsers(count, startId) {
  const users = [];
  for (let i = 0; i < count; i += 1) {
    const id = startId + i;
    const username = faker.internet.userName().toLowerCase().slice(0, 30);
    const email = faker.internet.email().toLowerCase();
    users.push({ id, username, email });
  }
  return users;
}

function openDb() {
  return pool;
}

function execAsync(db, sql, params = []) {
  return db.query(sql, params);
}

function prepareAsync(_db, sql) {
  return Promise.resolve(sql);
}

function finalizeAsync() {
  return Promise.resolve();
}

function runAsync(db, sql, params) {
  return db.query(sql, params);
}

async function batchInsert(db, sql, rows, batchSize) {
  const client = await db.connect();
  try {
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await client.query("BEGIN");
      for (const row of batch) {
        await client.query(sql, row);
      }
      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function injectUsers(db, config) {
  faker.seed(config.fakerSeed);
  const users = buildUsers(config.userCount, config.startUserId);
  const insertedIds = [];
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const user of users) {
      const result = await client.query(addUser, [user.username, user.email]);
      insertedIds.push(result.rows[0].id);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return insertedIds;
}

async function injectFollowers(db, userIds, config) {
  const edges = generateFollowerEdges(userIds, config);
  const rows = edges.map((edge) => [edge.user_id, edge.follower_id]);
  await batchInsert(db, addFollower, rows, config.batchSize);
  return edges.length;
}

function postJson(path, body) {
  const payload = JSON.stringify(body);
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const response = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(response);
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}: ${response}`));
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function simulateTweets(userIds, config) {
  const totalTweets = config.tweetRatePerSec * config.tweetDurationSec;
  let sent = 0;

  for (let second = 0; second < config.tweetDurationSec; second += 1) {
    const tasks = [];
    for (let i = 0; i < config.tweetRatePerSec; i += 1) {
      const userId = userIds[randomInt(0, userIds.length - 1)];
      const content = faker.lorem.sentence();
      tasks.push(postJson("/tweet", { user_id: userId, content }));
    }
    await Promise.all(tasks);
    sent += tasks.length;
    if (second < config.tweetDurationSec - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { sent, totalTweets };
}

module.exports = {
  API_HOST,
  API_PORT,
  DEFAULT_CONFIG,
  batchInsert,
  buildUsers,
  execAsync,
  generateFollowerCounts,
  generateFollowerEdges,
  injectFollowers,
  injectUsers,
  openDb,
  postJson,
  prepareAsync,
  finalizeAsync,
  randomInt,
  runAsync,
  sampleDistinctIds,
  scaleCountsToAvg,
  simulateTweets,
};
