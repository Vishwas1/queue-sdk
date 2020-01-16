import { IQueue } from '../../IQueue';
import { Connection } from '../../conn/Connection'
import * as RSMQPromise from 'rsmq-promise'
import * as redis from 'redis';
import { QTYPE } from '../../Qtype';
export class RedisQueue implements IQueue {
  rsmq: RSMQPromise;
  qchannels: Object;
  channel: string;
  delay: number;
  redisClient: redis.RedisClient;
  constructor(host: string, port: string, channel: string, delay: number = 0){
    this.rsmq = Connection.get(host, port, QTYPE.REDIS) 
    this.redisClient = redis.createClient(Number(port), host);
    this.channel = channel;
    this.qchannels = {};
    this.delay = delay;
  }

  private async checkIfQueuePresent() : Promise<boolean> {
    if(this.qchannels[this.channel]){
      return true
    }
    const queues = await this.channels();
    queues.map((elm) => this.qchannels[elm] = true)
    return this.qchannels[this.channel] == true
  }

  private async createChannelIfNotPresent(){  
    if(!await this.checkIfQueuePresent())
    {
      await this.create()
      this.qchannels[this.channel] = true;
    }      
  }

  async create(): Promise<void> {
    await this.rsmq.createQueue({qname: this.channel, maxsize: -1, delay: this.delay})
    console.log(`${this.channel} created`)
  }

  async push(message: any): Promise<string>{
    let mId: string;
    await this.createChannelIfNotPresent();
    mId = await this.rsmq.sendMessage({ qname: this.channel, message: JSON.stringify(message) })
    return mId;   
  }

  async pop(): Promise<any>{
    await this.createChannelIfNotPresent();
    let data = await this.rsmq.popMessage({ qname: this.channel })    
    try{
      data = Object.keys(data).length > 0 ? JSON.parse(data.message) : null;
    }catch(e){
      data = data;
    }
    return data
  }

  async size(): Promise<number>{
    await this.createChannelIfNotPresent();
    const mAttr = await this.rsmq.getQueueAttributes({ qname: this.channel })
    return mAttr.msgs;
  }

  async list(): Promise<any>{
    let messages = []
    return new Promise(async (resolve, reject) => {
      const searchKey = `rsmq:${this.channel}:Q`
      this.redisClient.hgetall(searchKey, (err, obj) => {
        if(err) reject([])
        if(!obj) reject([])
        if(Number(obj['totalsent']) == 0) reject([]);

        const keys = Object.keys(obj);
        const messageKeys = keys.filter(this.cb)
        messageKeys.forEach((eachKey) => {          
          messages.push(obj[eachKey])
        })
        resolve(messages);
      });        
    });
  }

  private cb (key:string) {
    if(key == "vt" || key == "delay" || key == "created" || key == "modified" || key == "totalsent" || key == "maxsize") return;
    return key
  }

  async clear(): Promise<void> {
    try{
      await this.rsmq.deleteQueue({ qname: this.channel })
    }catch(e){
    }
    console.log(`${this.channel} deleted`)
    await this.create();
    console.log(`${this.channel} cleared`)
  }

  async channels(): Promise<string[]>{
    const queues = await this.rsmq.listQueues()
    return queues;
  }
}

