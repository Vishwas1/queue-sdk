# Queue-SDK

Queue-sdk is a npm module which helps you to integrate with Queue services like Redis and Kafka. The sdk also has its own simple in-memory queue implemented which uses array as datast. Of-course you do not want to use it for production, but good for testing purposes. 

## Install

```sh
npm i queue-sdk --save
```

## Build 

```sh
npm i
npm run build
```

## Use

```js

//// Sample usage for REDIS queue

const { QueueSdk, QTYPE } =  require('queue-sdk')

const url = "http://127.0.0.1:6379"
const QueueConfig = new QueueSdk(QTYPE.REDIS, url); // Qtypes : SIMPLE (in-mem) | REDIS | KAFKA

const NEWQUEUE = QueueConfig.getQueue("READY");
let message = "Message to be pushed into queue"

await NEWQUEUE.clear(); // it will clear all messages of queue but  wil not delete the queue
let mid = await NEWQUEUE.push(message) // push message into queue
let size = await NEWQUEUE.size() // queue size
await NEWQUEUE.pop() // pop from queue
const channels = await NEWQUEUE.channels() // fetch all channels
await NEWQUEUE.list() // get all items from list
```


## NPM publish

```
npm login
npm version major | minor | patch
npm publish
```