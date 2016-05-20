/**
 * Created by Nicholas_Wang on 2016/4/13.
 */
var WS_PORT = 9531;
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:WS_PORT});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    console.log('new client connected');
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
  });
};

module.exports = {
    wss:wss
};

console.log('Socket server running at port: '+WS_PORT);