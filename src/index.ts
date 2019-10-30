import { QTYPE } from './Qtype';
import { RedisQueue } from './q/redis/Redis'
import { SimpleQueue } from './q/inmem/Simple'
import { KafkaQueue } from './q/kafka/Kafka'
import * as URL from 'url';

class QueueSdk{

  private qtype: QTYPE;
  private url: string;
  private host: string;
  private port: string;
  /**
   * 
   * @param url : Provide queue url in case of REDIS and KAFKA only
   * @param type : Provide queue type. Supported types are : SIMPLE, REDIS, KAFKA
   */
  constructor(type: QTYPE, url: string){

    if(!type){
      throw new Error('Queue type can not be empty')
    }
    
    this.qtype = type;
    this.url = url;

    if(this.qtype.toString() != QTYPE.SIMPLE.toString()){
      if(!url){
        throw new Error('Queue url can not be empty for REDIS or KAFKA')
      }
    }

    const urlParse = URL.parse(this.url);
    this.host = urlParse.hostname;
    this.port = urlParse.port;
  }

  /**
   * Returns an instance of REDIS | SIMPLE | KAFKA queue
   */
  public getQueue<T>(channel: string): RedisQueue | SimpleQueue | KafkaQueue {
    switch(this.qtype){
      case QTYPE.SIMPLE:{
        return new SimpleQueue()
      }
      case QTYPE.KAFKA:{
        return new KafkaQueue()
      }
      case QTYPE.REDIS:{        
        return new RedisQueue(this.host, this.port, channel);
      }
      default: return new SimpleQueue()
    }
  }  
}

module.exports = {
  QueueSdk,
  QTYPE
}