import { createRequire } from 'module';
import createSubscriber from 'pg-listen';

const require = createRequire(
    import.meta.url);

import express from "express";
const http = require('http');
const subscriber = createSubscriber({ connectionString: `postgres://${process.env.POSTGRESQL_USERNAME}:${process.env.POSTGRESQL_PASSWORD}@${process.env.POSTGRESQL_HOST}:5432/${process.env.POSTGRESQL_DATABASE}` })
    //const subscriber = createSubscriber({ connectionString: 'postgres://postgres:postgres@localhost:5432/isacode' })
const app = express();
const server = http.createServer({
    requestCert: false,
    rejectUnauthorized: false
}, app);

const sio = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: "https://pos.vendex.ec",
        methods: ["GET", "POST"],
    },
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*", //req.headers.origin, or the specific origin you want to give access to,
        };
        res.writeHead(200, headers);
        res.end();
    },
});

subscriber.notifications.on("virtual", (payload) => {
    try {
        if (payload != null && payload != undefined) {
            sio.emit(payload.channel, JSON.stringify({ mensaje: payload.mensaje, tipo: payload.tipo }));
        }
    } catch (error) {
        console.log(error);
    }

})
async function connect() {
    await subscriber.connect()
    await subscriber.listenTo("virtual")
}

server.listen(444);
console.log('Server start port 444');
connect();