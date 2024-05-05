import { MiddlewareHandler, Handler, Hono } from 'hono';
import { createFactory } from 'hono/factory';

export type Methods = ['get', 'post', 'put', 'delete', 'options', 'patch'][number];

export interface Routes {
  path: string;
  method: Methods;
  handlers: (Handler | MiddlewareHandler)[];
}

const factory = createFactory();

/*export const routes: Routes[] = [
  {
    path: '/bar',
    method: 'get',
    handlers: factory.createHandlers((c) => c.json({ bar: 'bar' }))
  },
  {
    path: '/foo',
    method: 'get' as const,
    handlers: factory.createHandlers((c) => c.json({ foo: 'foo' }))
  }
];
*/


import fs from 'fs';
import path from 'path';
// import { Routes } from './routes';

async function loadRoutes(): Promise<Routes[]> {
  const routesDir = path.join(__dirname, 'routes');
  const files = fs.readdirSync(routesDir);
  const routes: Routes[] = [];

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const { route } = await import(path.join(routesDir, file));
      routes.push(route);
    }
  }

  return routes;
}

export const routes = loadRoutes();