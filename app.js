import { createRequire } from 'module';
import createSubscriber from 'pg-listen';
const require = createRequire(
    import.meta.url);
import express from "express";

const http = require('http');
const subscriber = createSubscriber({ connectionString: `postgres://${process.env.POSTGRESQL_USERNAME}:${process.env.POSTGRESQL_PASSWORD}@${process.env.POSTGRESQL_HOST}:5432/${process.env.POSTGRESQL_DATABASE}` })
    //const subscriber = createSubscriber({ connectionString: 'postgres://postgres:postgres@localhost:5432/isacode' })

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    allowEIO3: true,
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

subscriber.notifications.on("virtual", (payload) => {
    try {
        if (payload != null && payload != undefined) {
            io.emit(payload.channel, JSON.stringify({ mensaje: payload.mensaje, tipo: payload.tipo }));
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