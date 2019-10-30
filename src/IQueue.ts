export interface IQueue{
  push(message: any): Promise<string>;
  pop(): Promise<any>;
  create(): Promise<void>;
  size(): Promise<number>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
  channels(): Promise<string[]>;
}
