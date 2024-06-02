import { StateManager } from './utils/stateManager';
import { parseHeaders, shCss, WebSocketData } from './utils/common';

global.log = (msg) => {
    console.log(msg); // Uncomment this line to enable logging
};

import { loadCommands } from './commands';
const commands = await loadCommands();

import { loadRoutes } from './routes';
const routes = await loadRoutes();

Bun.serve<WebSocketData>({
    async fetch(req: Request, server) {
        const { pathname } = new URL(req.url);

        if (pathname.startsWith('/ws/')) {
            const [user, room] = parseHeaders(req.headers);
            const success = server.upgrade(req, {
                data: {
                    roomCode: room,
                    userId: user,
                    ip: this.requestIP(req).address
                }
            });
            if (!success) {
                return Response.redirect("/");
            }
        } else if (pathname.startsWith('/api/')) {
            const route = routes.find((route) => new RegExp(route.pathRegex).test(pathname));

            if (route) {
                return route.handler(req);
            } else {
                return new Response('Not Found', { status: 404 });
            }
        } else {
            return Response.redirect("/");
        }
    },
    websocket: {
        maxPayloadLength: 512 * 1024, // 512KB
        open(ws) {
            StateManager.getInstance().initState(ws);
        },
        message(ws, message) {
            const state = StateManager.getInstance().getState(ws);
            const command = message.toString().split(' ')[0];
            let handler = commands[command];

            if (state.status !== 'OK' && command !== '/ping') {
                handler = commands['/ingress'];
            } else {
                if (!handler) {
                    handler = commands['/message'];
                }
            }
            handler(state, message.toString());
        },
        close(ws, code, message) {
            StateManager.getInstance().deleteState(ws);
        }
    },
    port: Number(process.env.PORT || 3000)
});
console.log(`\n🚀 App avaliable on port ${shCss.cyan}${shCss.underline}${(process.env.PORT || 3000)}${shCss.end}\n`);