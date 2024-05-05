import { createState, getState, restoreState, deleteState, keepAlive } from './utils/stateManager';
import { parseHeaders } from './utils/common';
import { commandHandlers } from './commands';

global.l = (msg) => {
    // console.log(msg); // Uncomment this line to enable logging
};

type WebSocketData = {
    roomCode: string | null;
    userId: string | null;
    isDebug: boolean;
};

Bun.serve<WebSocketData>({
    fetch(req, server) {
        const [user, room] = parseHeaders(req.headers);
        const success = server.upgrade(req, {
            data: {
                roomCode: room,
                userId: user,
                isDebug: new URL(req.url).searchParams.has('debug')
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
            const [command, ...args] = message.toString().split(' ');
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
            // global.l('Ping');
        },
        pong(ws) {
            // global.l('Pong');
        }
    },
    port: Number(process.env.WS_PORT || 3000)
});
console.log('🔌 WebSocket avaliable on port ' + '\u001b[1;32m' + (process.env.WS_PORT || 3000) + '\x1b[0m');

import { Hono } from 'hono';
import { routes } from './routes';

const app = new Hono().basePath('/api');
routes.map((route) => app.on(route.method, route.path, ...route.handlers));

export default {
    port: Number(process.env.REST_PORT || 3001),
    fetch: app.fetch
};

console.log('🔄 RESTful API avaliable on port ' + '\u001b[1;36m' + (process.env.REST_PORT || 3001) + '\x1b[0m');