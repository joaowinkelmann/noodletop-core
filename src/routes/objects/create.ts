import { RouteInterface, factory } from '~/routes';

export const route: RouteInterface = {
    method: 'post',
    handlers: factory.createHandlers((c) => c.json({ bar: 'bar' }))
};