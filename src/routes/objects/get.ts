import { RouteInterface, factory } from '~/routes';

export const route: RouteInterface = {
    method: 'get',
    handlers: factory.createHandlers((c) => c.json({ foo: 'foo' }))
};