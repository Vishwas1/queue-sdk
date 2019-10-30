const { QueueSdk } =  require('../dist/index')
const { QTYPE } =  require('../dist/Qtype')

const url = "http://127.0.0.1:6379"

const QueueConfig = new QueueSdk(QTYPE.REDIS, url);
const NEWQUEUE = QueueConfig.getQueue("READY");

let body = "Message to be pushed into queue"

const test = async () => {
  try{
    await NEWQUEUE.clear();

    let mid = await NEWQUEUE.push(body)
    console.log(mid)

    mid = await NEWQUEUE.push(body)
    console.log(mid)
    
    let size = await NEWQUEUE.size()
    console.log(size) //2

    await NEWQUEUE.pop()
    
    size = await NEWQUEUE.size()
    console.log(size) //1

    const channels = await NEWQUEUE.channels()
    console.log(JSON.stringify(channels))

    await NEWQUEUE.list()
  }catch(e){
    console.error(e)
  }
} 
test()
