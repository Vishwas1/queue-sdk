import * as RSMQPromise  from 'rsmq-promise';
import { QTYPE } from '../Qtype'

export class Connection {
  private static conn: Connection;
  private constructor(){}
  
  public static get(host:string, port: string, queueType : QTYPE): any{
    if (Connection.conn == null) {
      switch(queueType){
        case QTYPE.REDIS: {
          Connection.conn = new RSMQPromise({
            host: host, 
            port: port
          });
          new RSMQPromise()
          break;
        }
        case QTYPE.KAFKA: {
          //TODO
          Connection.conn = null;
          break;
        }
        default:{
          console.log('Please define Qtype')
        }
      }
    }
    return Connection.conn;
  }
}