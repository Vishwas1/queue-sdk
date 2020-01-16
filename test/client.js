const { QueueSdk } =  require('../dist/index')
const { QTYPE } =  require('../dist/Qtype')

const url = "http://127.0.0.1:6379"

const QueueConfig = new QueueSdk(QTYPE.REDIS, url);
const NEWQUEUE = QueueConfig.getQueue("READY", 5); 
// the second param is delay (in seconds)
// The time in seconds that the delivery of all new messages in the queue will be delayed. Allowed values: 0-9999999 (around 115 days)

let body = "Message to be pushed into queue"

const test = async () => {
  try{

    try{
      await NEWQUEUE.clear();
    }catch(e){

    }
  
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

    await NEWQUEUE.list()
  }catch(e){
    console.error(e)
  }
} 
test()
