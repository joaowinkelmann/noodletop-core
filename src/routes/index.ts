import { MiddlewareHandler, Handler, Hono } from 'hono';
import { createFactory } from 'hono/factory';

export type Methods = ['get', 'post', 'put', 'delete', 'options', 'patch'][number];

export interface RouteInterface {
    path?: string;
    method: Methods;
    handlers: (Handler | MiddlewareHandler)[];
}

export const factory = createFactory();


// Autoload all routes from the /src/routes/ folder
import fs from 'fs';
import path from 'path';

/**
 * Loads all routes from the current (routes) directory and returns an array of routes.
 * Each route object should have a 'path' property that represents the URL path for the route.
 * If a route's 'path' property is not defined, it will be calculated based on the file's location.
 * @returns A promise that resolves to an array of RouteInterface[].
 */
async function loadRoutes(): Promise<RouteInterface[]> {
    const routesDir = path.join(__dirname, '');
    const routes: RouteInterface[] = [];

    async function loadDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await loadDir(fullPath);
            } else if (entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
                try {
                    const { route } = await import(fullPath);

                    // if there's a defined path, use it. otherwise, calculate the path based on the file's location.
                    if (!route.path) {
                        // Calculate the relative path to the /src/routes/ folder
                        const relativePath = path.relative(path.join(__dirname, ''), fullPath);

                        // Convert the file path to a URL path
                        const urlPath = '/' + relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');

                        // Update the route path with the calculated URL path
                        route.path = urlPath;
                    }

                    routes.push(route);
                } catch (error) {
                    // @todo - For some reason, some routes are being loaded twice here, leading to an error. No, using require() instead of await import() doesn't fix it, apparently.
                    console.error(`Failed to import route from ${fullPath}: ${error}`);
                }
            }
        }
    }

    await loadDir(routesDir);

    return routes;
}

export const routes = await loadRoutes();