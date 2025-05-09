const tls = require('tls');
const wss = require('ws');

// Load SSL key and certificate files (replace with your own files)
const serverOptions = {
  key: require('./key.pem'),
  cert: require('./cert.pem')
};

// Create a TLS socket server
const server = tls.createServer(serverOptions).listen(8443, () => {
  console.log('Server is listening on port 8443');
});

// Create WebSocket server attached to the TLS server
const wsserver = new wss.Server({ server });

wsserver.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle messages from clients
  ws.on('message', (msg) => {
    const message = msg.toString();
    console.log(`Received: ${message}`);
    
    // Echo the received message back to the client
    ws.send(message);
  });
});