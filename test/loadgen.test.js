"use strict";

const assert = require("assert");
const test = require("node:test");
const {
  DEFAULT_CONFIG,
  generateFollowerCounts,
  generateFollowerEdges,
  buildUsers,
} = require("../loadgen_utils");

test("buildUsers creates requested count with sequential ids", () => {
  const users = buildUsers(5, 10);
  assert.equal(users.length, 5);
  assert.equal(users[0].id, 10);
  assert.equal(users[4].id, 14);
  users.forEach((user) => {
    assert.ok(user.username);
    assert.ok(user.email);
  });
});

test("generateFollowerCounts returns bounded counts", () => {
  const config = { ...DEFAULT_CONFIG, avgFollowers: 6, maxFollowers: 12 };
  const counts = generateFollowerCounts(50, config);
  assert.equal(counts.length, 50);
  counts.forEach((count) => {
    assert.ok(count >= 0);
    assert.ok(count <= config.maxFollowers);
  });
});

test("generateFollowerEdges avoids self-follow and duplicates per user", () => {
  const userIds = [1, 2, 3, 4, 5];
  const config = { ...DEFAULT_CONFIG, avgFollowers: 2, maxFollowers: 3 };
  const edges = generateFollowerEdges(userIds, config);

  const seenByUser = new Map();
  edges.forEach(({ user_id, follower_id }) => {
    assert.notEqual(user_id, follower_id);
    const key = user_id;
    if (!seenByUser.has(key)) {
      seenByUser.set(key, new Set());
    }
    const set = seenByUser.get(key);
    assert.ok(!set.has(follower_id));
    set.add(follower_id);
  });
});
