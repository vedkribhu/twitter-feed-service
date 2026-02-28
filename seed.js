const sqlite3 = require("sqlite3").verbose();
const {
  createFollowerTable,
  createTweetsTable,
  createUserTable,
  addUser,
  addFollower,
  addTweet,
  createFeedTable,
} = require("./queries");

const db = new sqlite3.Database("./twitter.db");
function createTables() {
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    db.run(createUserTable);
    db.run(createFollowerTable);
    db.run(createTweetsTable);
    db.run(createFeedTable);
    // const stmt = db.prepare("INSERT INTO lorem VALUES (?)");

    // for (let i = 0; i < 10; i++) {
    //   stmt.run(`Ipsum ${i}`);
    // }

    // stmt.finalize();

    // db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    //   console.log(`${row.id}: ${row.info}`);
    // });
  });
}

function insertUsers() {
  db.run(addUser, [1, "mike shinoda", "mik.s@gmail.com"]);
  db.run(addUser, [2, "vedant", "vedanta.b@gmail.com"]);
}

function injectFollower() {
  db.run(addFollower, [1, 2]);
}

function injectTweet() {
  db.run(addTweet, [1, 1, "Nice concert today. Good work crew!"]);
}

createTables();
insertUsers();
injectFollower();
// injectTweet();

db.close();
