const http = require('https'); // import https
const fs = require('fs');
const app = require('./app'); //import app
const config = require('./config').config
const WebSocketServer = require('websocket').server

const normalizePort = val => { //normalize port check forr real number 
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(config.port || '3300');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      config.logger.info(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      config.logger.debug(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};
const options = config.environment == 'development' ? {
  key: fs.readFileSync('../../../etc/letsencrypt/live/feather.com.ng/privkey.pem'),
  cert: fs.readFileSync('../../../etc/letsencrypt/live/feather.com.ng/fullchain.pem')
}: {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
} ;

const server = http.createServer(options, app);


server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  config.logger.info('Listening on ' + bind);

});

server.listen(port);

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  path: 'messaging'
});


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    config.logger.info((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  
  var connection = request.accept("messaging", request.origin);

  config.logger.info((new Date()) + ' Connection accepted.');
  connection.on('open', function(reasonCode, description) {
    config.logger.info((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');
    connection.send("connection accepted by server")
  });

  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          config.logger.info('Received Message: ' + message.utf8Data);
          connection.sendUTF(message.utf8Data);
      }
      else if (message.type === 'binary') {
          config.logger.info('Received Binary Message of ' + message.binaryData.length + ' bytes');
          connection.sendBytes(message.binaryData);
      }
  });
  connection.on('close', function(reasonCode, description) {
      config.logger.info((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      connection.send((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
  });
});
