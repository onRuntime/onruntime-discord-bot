import 'reflect-metadata';
import Bot from './Bot';
import * as http from 'http';

new Bot();

http.createServer((_, res) => {
  res.writeHead(200);
  res.end('Hello World!');
}).listen(8080);

export default Bot;
