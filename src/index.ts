import 'reflect-metadata';
import Bot from './Bot';
import * as http from 'http';

new Bot();

http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
}).listen(8080, () => {
  console.log('Server running on port 8080');
});

export default Bot;
