import { IQueue } from '../../IQueue';
import { Connection } from '../../conn/Connection'
import * as RSMQPromise from 'rsmq-promise'
import { QTYPE } from '../../Qtype';

export class RedisQueue implements IQueue {
  rsmq: RSMQPromise;
  qchannels: Object;
  channel: string;
  constructor(host: string, port: string, channel: string){
    this.rsmq = Connection.get(host, port, QTYPE.REDIS)
    this.channel = channel;
    this.qchannels = {};
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
    await this.rsmq.createQueue({qname: this.channel, maxsize: -1 })
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

  //TODO
  list(): Promise<string []>{
    return new Promise((resolve, reject) => {
      reject('Method not implemented')
    });
  }

  async clear(): Promise<void> {
    await this.rsmq.deleteQueue({ qname: this.channel })
    delete this.qchannels[this.channel]
    console.log(`${this.channel} deleted`)
  }

  async channels(): Promise<string[]>{
    const queues = await this.rsmq.listQueues()
    return queues;
  }
}

