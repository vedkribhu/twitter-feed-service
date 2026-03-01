# twitter-feed-service

## Main objectives
Goal: Design feed/:userID endpoint. Evaluate fan out read vs fan out write.
Completion check list:
1. Write queries, indexes, seed script
2. simulate the load
3. look under the hood of query strategies and joins
4. pros and cons of each data model and approach to implement the feed

1. Load description
    1. 4.6k tweets per second
    2. 75 followers on average
  
Focus on writing the sql queries, designing database yourself. You can use ai to do everything else.


## Databse Model

tweets table
id:int
content: string
user_id:int (FK)
created_at

users table
id: int
username: string
email: string
created_at

feed
user_id: int
tweet_id: int
PK: user_id, tweet_id
FK: user_id,
FK: tweet_id

followers
user_id: int
follower_id: int
PK: follower_id, user_id
FK: follower_id
FK: user_id

### Indexes
tweets table
  1. user_id

follower table: 
  1. user_id, 
  2. follower_id

feed table
  1. user_id
  2. tweets_id
  

## Open questions
1. strategies you employ to model one-to-one, many-to-one, one-to-many, many-to-many relationships in database
2. is normalization always the best approach? -> fractional indexing?
3. why is relational database model so powerful? Is the model all about trying to get to normalized databse model?


When working on feed
1. should i run a cleanup job on feed table
2. so join is basically saving application code to do three table lookups

Many to many relationship

## Load generation scripts
One-shot user + follower seeding:
- `node seed_users_followers.js`
- Optional env: `USER_COUNT`, `START_USER_ID`, `AVG_FOLLOWERS`, `MAX_FOLLOWERS`,
  `HEAVY_TAIL_FRACTION`, `SMALL_FOLLOWER_MAX`, `PARETO_ALPHA`, `BATCH_SIZE`,
  `FAKER_SEED`

Continuous tweet injection (REST API, keep server running):
- `node app.js`
- `node inject_tweets.js`
- Optional env: `USER_COUNT`, `START_USER_ID`, `TWEET_RATE_PER_SEC`,
  `TWEET_DURATION_SEC` (0 = run forever), `FAKER_SEED`, `API_HOST`, `API_PORT`
