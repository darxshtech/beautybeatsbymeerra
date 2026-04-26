const https = require('https');
const http = require('http');
const mongoose = require('mongoose');

class KeepAwakeService {
    static start() {
        console.log('[KeepAwake] Service initialized. Will ping db and server between 5 and 10 minutes.');

        const ping = async () => {
            console.log('[KeepAwake] Running periodic ping to keep server and DB awake...');
            
            // 1. Ping the Database
            try {
                if (mongoose.connection && mongoose.connection.db) {
                    await mongoose.connection.db.admin().ping();
                    console.log('[KeepAwake] Database ping successful.');
                }
            } catch (err) {
                console.error('[KeepAwake] Error pinging database:', err.message);
            }

            // 2. Ping the Server URL itself to trigger an incoming HTTP request
            // Best practice is to set SERVER_URL to the public base URL in your production environment (e.g. https://my-app.onrender.com)
            const serverUrl = process.env.SERVER_URL || `http://127.0.0.1:${process.env.PORT || 5000}/`;
            
            try {
                const reqModule = serverUrl.startsWith('https') ? https : http;
                reqModule.get(serverUrl, (res) => {
                    if (res.statusCode === 200) {
                         console.log(`[KeepAwake] Server ping successful. Status: ${res.statusCode}`);
                    }
                    // Consume response data to free up memory
                    res.on('data', () => {}); 
                    res.on('end', () => {});
                }).on('error', (err) => {
                    console.error('[KeepAwake] Error pinging server:', err.message);
                });
            } catch (err) {
                console.error('[KeepAwake] Failed to initiate server ping:', err.message);
            }

            // Schedule the next ping between 5 and 10 minutes
            const minMs = 5 * 60 * 1000;
            const maxMs = 10 * 60 * 1000;
            const nextDelay = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
            const nextMins = (nextDelay / 60000).toFixed(1);
            
            console.log(`[KeepAwake] Next ping scheduled in ${nextMins} minutes.`);
            setTimeout(ping, nextDelay);
        };

        // Schedule the very first ping
        const initialDelay = Math.floor(Math.random() * (10 * 60 * 1000 - 5 * 60 * 1000 + 1) + 5 * 60 * 1000);
        setTimeout(ping, initialDelay);
    }
}

module.exports = KeepAwakeService;
