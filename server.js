const fs = import('fs');
const crypto = import('crypto');

const express = import('express');
const app = express();
app.use(express.static(__dirname));

let privateKey;

async function readPrivateKey() {
    try {
        const keyFile = await fs.promises.readFile('./server.key', 'utf8');
        return keyFile;
    } catch (error) {
        console.error('Error reading private key:', error);
        return null;
    }
}

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: app });

wss.on('connection', function connection(ws) {
    readPrivateKey().then(async (keyData) => {
        if (!keyData) {
            ws.send('No private key found. Please check the file path.');
            return;
        }

        const privateKeyHash = crypto.createHash('sha256').update(keyData).digest('hex');
        ws.send(`Private key hash: ${privateKeyHash}`);
    }).catch(error => {
        console.error('Error processing connection:', error);
        ws.close();
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

app.use('/ws', wss);

// Start server on port 3000
const server = app.listen(3000, function() {
    console.log('Server running on port 3000');
});