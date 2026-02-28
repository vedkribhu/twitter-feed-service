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

tweet table
id:
content:
user:


user table
id: 


follower table
followerId, followeeId

feed table
userId, feed


Thinking process when designing feed

two options: 
- keep track of what is seen by a user

user 
- when a tweet is written put it in a feed table with (userId, tweetID, tweetContent, userName)

Cons: 
the feed table will grow crazy in size -> is that a problem? sharding??


Qustion:
What is my concern? Number of queries? 








Tasks:
create relevant tables
simulate this load -> an endpoint to post a tweet, an endpoint to get the feed
implement fan out read
implement fan out write


Goal-> Find 100 new tweets from all users that I follow
query -> find all users 

## Open questions
1. strategies you employ to model one-to-one, many-to-one, one-to-many, many-to-many relationships in database
2. is normalization always the best approach? -> fractional indexing?
3. why is relational database model so powerful? Is the model all about trying to get to normalized databse model?


Many to many relationship
