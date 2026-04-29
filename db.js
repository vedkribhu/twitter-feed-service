const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "twitter_feed",
  user: "postgres",
  password: "postgres",
});

module.exports = { pool };
