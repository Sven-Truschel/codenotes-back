const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const baseUrl = '192.168.178.10'

const server = http.createServer(app);

server.listen(port, baseUrl);