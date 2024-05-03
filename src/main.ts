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
console.log('🔌 WebSocket avaliable on port ' + '\u001b[1;32m' + (process.env.WS_PORT || 3000) + "\x1b[0m");


// import { init } from '@stricjs/app';
// init({ 
//     // Auto prefix routes path by directory name
//     autoprefix: true,
//     // Load routes from specific directories
//     routes: ['./src/routes'],
//     serve: { port: 3001 },

// });

import { build } from '@stricjs/app';
import { status } from '@stricjs/app/send';

// Build routes
const rest = await build({
    autoprefix: true,
    routes: ['./src/routes'],

    // Serve options
    serve: {
        // reusePort: true,
        error: (err) => {
            console.error(err);
            return status(null, 500);
        },
        port: Number(process.env.REST_PORT || 3001),
    }
});

rest.logRoutes();

export default rest.boot();



console.log('🔄 RESTful API avaliable on port ' + '\u001b[1;36m' + (process.env.REST_PORT || 3001) + "\x1b[0m");