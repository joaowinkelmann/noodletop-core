import { shCss } from '../utils/common';

export type Methods = ['get', 'post', 'put', 'delete', 'options', 'patch'][number];

const methodColors = {
    'get': shCss.blue,
    'post': shCss.green,
    'put': shCss.yellow,
    'delete': shCss.red,
    'options': shCss.yellow,
    'patch': shCss.magenta
};

export interface RouteInterface {
    pathRegex: RegExp;
    description?: string;
    method: Methods;
    handler: (Request) => Response;
}

const defaultResponse = () => Response.redirect('/');

// Autoload all routes from the /src/routes/ folder
import fs from 'fs';
import path from 'path';

import { promisify } from 'util';
const readdir = promisify(fs.readdir);

export class Router {
    private routes: RouteInterface[];

    constructor() {
        this.routes = [];
    }

    public async loadRoutes(): Promise<RouteInterface[]> {
        global.log(`→ Started loading routes...`);
        const routesDir = path.join(__dirname, '');
        const foundRoutes: RouteInterface[] = [];
        async function loadDir(dir: string): Promise<void> {
            const entries = await readdir(dir, { withFileTypes: true });
            const imports: Promise<void>[] = [];
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    imports.push(loadDir(fullPath));
                } else if (entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
                    imports.push(
                        import(fullPath).then(({ route }) => {
                            if (!route.pathRegex) {
                                const relativePath = path.relative(path.join(__dirname, ''), fullPath);
                                const urlPath = '/api/' + relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
                                route.pathRegex = urlPath;
                            }
                            foundRoutes.push(route);
                            global.log(`\tLoaded ${methodColors[route.method]}${route.method.toUpperCase()}${shCss.end} ${shCss.bold}${route.pathRegex}${shCss.end}`);
                        }).catch((error) => {
                            console.error(`Failed to import route from ${fullPath}: ${error} - ${error.stack}`);
                        })
                    );
                }
            }
            await Promise.all(imports);
        }

        if (this.routes.length === 0) {
            await loadDir(routesDir);
            this.routes = foundRoutes;
        }
        global.log(`${shCss.green}→ Route loading finished!${shCss.end}`);
        return this.routes;
    }

    public async route(req: Request): Promise<Response> {
        const route = this.routes.find((route) => route.pathRegex.test(new URL(req.url).pathname));
        return route 
            ? route.handler(req) 
            // : Promise.resolve(Response.json({ error: 'Route not found' }, { status: 404}));
            : defaultResponse();
    }
}