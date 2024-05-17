import { createState, getState, restoreState, deleteState, keepAlive } from './utils/stateManager';
import { parseHeaders, WebSocketData } from './utils/common';
import { commandHandlers } from './commands';

global.log = (msg) => {
    console.log(msg); // Uncomment this line to enable logging
};

Bun.serve<WebSocketData>({
    fetch(req, server) {
        const [user, room] = parseHeaders(req.headers);
        const success = server.upgrade(req, {
            data: {
                roomCode: room,
                userId: user
            }
        });

        if (success) return undefined;

        return Response.redirect('/');
    },
    websocket: {
        maxPayloadLength: 2048 * 1024, // 2 MiB
        open(ws) {
            let state;
            if (ws.data.userId && ws.data.roomCode) {
                state = restoreState(ws, ws.data.userId, ws.data.roomCode);
            }
            if (!state) {
                state = createState(ws);
            }
            keepAlive(ws);
        },
        message(ws, message) {
            const state = getState(ws);
            const command = message.toString().split(' ')[0];
            let handler = commandHandlers[command];

            if (state.status !== 'OK') {
                handler = commandHandlers['/ingress'];
            } else {
                if (!handler) {
                    handler = commandHandlers['/message'];
                }
            }
            handler(state, message.toString());
        },
        close(ws, code, message) {
            // stateMap.delete(ws);
            deleteState(ws);
        },
        ping(ws) {
            // global.log('Ping');
        },
        pong(ws) {
            // global.log('Pong');
        }
    },
    port: Number(process.env.WS_PORT || 3000)
});
console.log('🔌 WebSocket avaliable on port ' + '\u001b[1;32m' + (process.env.WS_PORT || 3000) + '\x1b[0m');


// Db Testing
// import { Db } from './database';
// const db = new Db();
// db.connect();
// db.insOne('test', { name: 'test3', });
// db.modOne('test', { name: 'test3' }, { $set: { name: 'test4' } });
// db.remOne('test', { name: 'test2', });
// db.disconnect();

import { Hono } from 'hono';
import { routes } from './routes';

const app = new Hono().basePath('/api');
routes.map((route) => app.on(route.method, route.path, ...route.handlers));

export default {
    port: Number(process.env.REST_PORT || 3001),
    fetch: app.fetch
};

console.log('🔄 RESTful API avaliable on port ' + '\u001b[1;36m' + (process.env.REST_PORT || 3001) + '\x1b[0m');