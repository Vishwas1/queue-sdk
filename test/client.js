const { QueueSdk } =  require('../dist/index')
const { QTYPE } =  require('../dist/Qtype')

const url = "http://127.0.0.1:6379"

const QueueConfig = new QueueSdk(QTYPE.REDIS, url);
const NEWQUEUE = QueueConfig.getQueue("READYMMMM", 5); 
const RETRYQ = QueueConfig.getQueue("RETRYQ"); 
const SUCCESSQ = QueueConfig.getQueue("SUCCESSQ"); 
// the second param is delay (in seconds)
// The time in seconds that the delivery of all new messages in the queue will be delayed. Allowed values: 0-9999999 (around 115 days)

let body = "Message to be pushed into queue"

const test = async () => {
  try{
    
    await NEWQUEUE.clear();
    await RETRYQ.push(body)
    await SUCCESSQ.push(body)
  
    let mid = await NEWQUEUE.push(body)
    console.log(mid)

    mid = await NEWQUEUE.push(body)
    console.log(mid)
    
    let size = await NEWQUEUE.size()
    console.log(size) //2

    setTimeout(async() => {
      await NEWQUEUE.pop()    
      size = await NEWQUEUE.size()
      console.log(size) //1 
    }, 6000)

    await NEWQUEUE.pop()
    
    size = await NEWQUEUE.size()
    console.log(size) //2 -  still 2 even after pop, becuase we have delayed messages by 5sec

    const channels = await NEWQUEUE.channels()
    console.log(JSON.stringify(channels))

    const messages = await NEWQUEUE.list()
    console.log(messages)


  }catch(e){
    console.error(e)
  }
} 
test()
