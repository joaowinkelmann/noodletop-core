// import { createState, getState, restoreState, deleteState, keepAlive } from './utils/stateManager';
import { StateManager } from './utils/stateManager';
import { parseHeaders, shCss, WebSocketData } from './utils/common';
import { commandHandlers } from './commands';

global.log = (msg) => {
    console.log(msg); // Uncomment this line to enable logging
};

//load routes
import { loadRoutes } from './routes';

// async function main() {
const routes = await loadRoutes();
// }

// const app = await main(); // call the main function and store the returned app

Bun.serve<WebSocketData>({
    async fetch(req: Request, server) {
        const [user, room] = parseHeaders(req.headers);
        // const success = server.upgrade(req, {
        //     data: {
        //         roomCode: room,
        //         userId: user
        //     }
        // });

        // if (success) return undefined;

        const { method } = req;
        const { pathname } = new URL(req.url);
        const pathRegexForID = /^\/api\/posts\/(\d+)$/;

        if (pathname.startsWith('/ws/')) {
            // Upgrade to WebSocket
            const [user, room] = parseHeaders(req.headers);
            server.upgrade(req, {
                data: {
                    roomCode: room,
                    userId: user
                }
            });
        } else if (pathname.startsWith('/api/')) {
            // Route to API router
            // Implement your router logic here
            // Example:
            // if (pathname === '/api/posts') {
            //     return handlePostsRequest(req);
            // } else if (pathname === '/api/users') {
            //     return handleUsersRequest(req);
            // } else {
            //     return handleNotFound(req);
            // }
            // console.log(routes);

            const route = routes.find((route) => route.path === pathname);
            if (route) {
                // return route.handlers(req);
                console.log("hooray");
                // return route.handlers(req);
            } else {
                // console.log("nope");
                // log the first route found under routes
                console.log(routes[0]);
                console.log(pathname);
            }

        }
        return Response.redirect('/');
    },
    websocket: {
        maxPayloadLength: 2048 * 1024, // 2 MiB
        open(ws) {
            let state;
            if (ws.data.userId && ws.data.roomCode) {
                state = StateManager.restoreState(ws, ws.data.userId, ws.data.roomCode);
            }
            if (!state) {
                state = StateManager.createState(ws);
            }
            StateManager.keepAlive(ws);
        },
        message(ws, message) {
            const state = StateManager.getState(ws);
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
            StateManager.deleteState(ws);
        },
        ping(ws) {},
        pong(ws) {}
    },
    port: Number(process.env.WS_PORT || 3000),

});
console.log(`🔌 WebSocket avaliable on port ${shCss.green}${(process.env.WS_PORT || 3000)}${shCss.end}\n`);


// Db Testing
// import { Db } from './database';
// const db = new Db();
// db.connect();
// db.insOne('test', { name: 'test3', });
// db.modOne('test', { name: 'test3' }, { $set: { name: 'test4' } });
// db.remOne('test', { name: 'test2', });
// db.disconnect();

// import { Hono } from 'hono';
// import path from 'path';
// import { routes } from './routes';

// const app = new Hono().basePath('/api');
// routes.map((route) => app.on(route.method, route.path, ...route.handlers));

// export default {
//     port: Number(process.env.REST_PORT || 3001),
//     fetch: app.fetch
// };

// import { loadRoutes } from './routes';

// async function main() {
//     const routes = await loadRoutes();

//     const app = new Hono().basePath('/api');
//     routes.map((route) => app.on(route.method, route.path, ...route.handlers));

//     // rest of your code...

//     return app; // return the app
// }

// const app = await main(); // call the main function and store the returned app

// export default {
//     port: Number(process.env.REST_PORT || 3001),
//     fetch: app.fetch,
//     log: false
// };

// console.log(`\n🔄 RESTful avaliable on port ${shCss.cyan}${(process.env.REST_PORT || 3001)}${shCss.end}`);