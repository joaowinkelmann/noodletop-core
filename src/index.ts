import { broadcastMessage, chooseNickname, chooseRoom } from './utils/message';
import { createState, getState, keepAlive } from './utils/stateManager';
import { parseHeaders } from './utils/common';

global.log = (msg) => {
    // console.log(msg); // Uncomment this line to enable logging
};

const stateMap = new Map();

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

        if (success) {
            return undefined;
        }

        return Response.redirect('/');
    },
    websocket: {
        maxPayloadLength: 2048 * 1024, // 2 MiB
        open(ws) {
            // Throwing back debug info
            if (ws.data.isDebug) {
                ws.send(`d:data: ${JSON.stringify(ws.data)}`);
            }
            let state;
            if (ws.data.userId && ws.data.roomCode) {
                state = getState(ws, ws.data.userId, ws.data.roomCode);
            }
            if (!state) {
                state = createState(ws);
                ws.send('?room');
            } else {
                ws.send(`u ` + state.user.getId());
            }
            stateMap.set(ws, state);
            keepAlive(ws);
        },
        message(ws, message) {
            const state = stateMap.get(ws); // Retrieve the state from the Map
            const messageString = message.toString();

            switch (state.status) {
                case 'ROOM':
                    return chooseRoom(messageString, state);
                case 'NICKNAME':
                    return chooseNickname(messageString, state);
                default:
                    return broadcastMessage(messageString, state);
            }
        },
        close(ws, code, message) {
            stateMap.delete(ws);
        },
        ping(ws) {
            // global.log('Ping');
        },
        pong(ws) {
            // global.log('Pong');
        }
    },
    port: Number(process.env.PORT || 3000)
});
console.log('🔌 WebSocket avaliable on port ' + (process.env.PORT || 3000));