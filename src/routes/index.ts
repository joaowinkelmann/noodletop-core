import { MiddlewareHandler, Handler, Hono } from 'hono';
import { createFactory } from 'hono/factory';
import { shCss } from '~/utils/common';

export type Methods = ['get', 'post', 'put', 'delete', 'options', 'patch'][number];

const methodColors = {
    'get': shCss.blue,
    'post': shCss.green,
    'put': shCss.yellow,
    'delete': shCss.red,
    'options': shCss.yellow,
    'patch': shCss.magenta,
};

export interface RouteInterface {
    path?: string;
    method: Methods;
    handlers: (Handler | MiddlewareHandler)[];
}

export const factory = createFactory();


// Autoload all routes from the /src/routes/ folder
import fs from 'fs';
import path from 'path';

import { promisify } from 'util';
const readdir = promisify(fs.readdir);

let routes: RouteInterface[];

/**
 * Loads all routes from the current (routes) directory and returns an array of routes.
 * Each route object should have a 'path' property that represents the URL path for the route.
 * If a route's 'path' property is not defined, it will be calculated based on the file's location.
 * @returns A promise that resolves to an array of RouteInterface[].
 */
export async function loadRoutes(): Promise<RouteInterface[]> {
    // console.warn("loadRoutes called")
    global.log("Started loading routes...")
    const routesDir = path.join(__dirname, '');
    const foundRoutes: RouteInterface[] = [];

    async function loadDir(dir: string): Promise<void> {
        const entries = await readdir(dir, { withFileTypes: true });

        const imports: Promise<void>[] = [];

        for (const entry of entries) {

            // console.log("====================================")
            // console.log(JSON.stringify(entry.name));
            // console.log("====================================")
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                imports.push(loadDir(fullPath));
            } else if (entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
                imports.push(
                    import(fullPath).then(({ route }) => {
                        if (!route.path) {
                            const relativePath = path.relative(path.join(__dirname, ''), fullPath);
                            // const urlPath = '/' + relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
                            // add /api/ to the path
                            const urlPath = '/api/' + relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
                            route.path = urlPath;
                        }

                        foundRoutes.push(route);
                        // global.log(`Loaded route ${route.method.toUpperCase()} ${route.path}`);
                        // loggin method with color
                        // global.log(`Loaded route ${methodColors[route.method](route.method.toUpperCase())} ${route.path}`);
                        // global.log(`Loaded route ${methodColors[route.method]}${route.method.toUpperCase()}\x1b[0m ${route.path}`);
                        global.log(`Loaded ${methodColors[route.method]}${route.method.toUpperCase()}${shCss.end} ${shCss.bold}${route.path}${shCss.end}`);

                    }).catch((error) => {
                        // console.error(`Failed to import route from ${fullPath}: ${error}`);
                        console.error(`Failed to import route from ${fullPath}: ${error} - ${error.stack}`);
                    })
                );
            }
        }

        await Promise.all(imports);
    }

    // await loadDir(routesDir);

    // return routes;
    if (!routes) {
        await loadDir(routesDir);
        routes = foundRoutes;
    }
    global.log("Route loading finished!")
    return routes;
}

// export const routes = await loadRoutes();
export { routes };