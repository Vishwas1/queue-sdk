export interface IQueue{
  push(message: any): Promise<string>;
  pop(): Promise<any>;
  create(): Promise<void>;
  size(): Promise<number>;
  list(): Promise<any>;
  clear(): Promise<void>;
  channels(): Promise<string[]>;
}
