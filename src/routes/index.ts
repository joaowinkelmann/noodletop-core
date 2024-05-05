import { MiddlewareHandler, Handler, Hono } from 'hono';
import { createFactory } from 'hono/factory';

type Methods = ['get', 'post', 'put', 'delete', 'options', 'patch'][number];

interface Routes {
  path: string;
  method: Methods;
  handlers: (Handler | MiddlewareHandler)[];
}

const factory = createFactory();

export const routes: Routes[] = [
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