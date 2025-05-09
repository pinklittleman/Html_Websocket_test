const fs = require('fs');
const crypto = require('crypto');

// Read the private key file
const privateKey = fs.readFileSync('./server.key', 'utf8');

try {
    // Parse and create a private key object
    const parsePrivateKey = (privatekey) => {
        const headerBegin = '-----BEGIN PRIVATE KEY-----';
        const headerEnd = '-----END PRIVATE KEY-----';

        if (!privatekey.startsWith(headerBegin) || !privatekey.endsWith(headerEnd)) {
            throw new Error('Invalid private key format');
        }

        const content = privatekey.slice(
            headerBegin.length,
            -headerEnd.length
        ).trim();

        // Create the private key object
        return crypto.createPrivateKey({
            type: 'pkcs1-rsa-sha256',
            key: content,
        });
    };

    // Use the parsed private key in your TLS connection
    const server = tls.createServer({ port: 443 }, (socket) => {
        socket.on('close', () => {
            console.log('TLS server closed');
        });
    });

    const conn = await parsePrivateKey(privateKey);

    server.on('tlsConnect', async (res, callback) => {
        try {
            // Use the private key for authentication
            const auth = await crypto.createAuth(res, conn);
            
            if (auth.error) {
                console.log('Authentication failed:', auth.error);
                res.destroy(4006); // Close the connection with an error code
                return;
            }

            callback(null, 1); // Accept the client connection
        } catch (err) {
            console.error('TLS server authentication failed:', err);
            res.destroy(4005); // Destroy the connection due to unauthorized access
        }
    });

    await server.listen(() => {
        console.log('TLS server is now listening on port 443');
    });
} catch (err) {
    console.error('Error reading or parsing private key:', err);
}