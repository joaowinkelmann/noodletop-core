import { Room } from '~/models/room';
import { RouteInterface, factory } from '~/routes';
import { StateManager } from '~/utils/stateManager';

export const route: RouteInterface = {
    method: 'get',
    // handlers: factory.createHandlers((c) => c.json({ foo: 'foo' }))
    // get all objects from a given room
    handlers: factory.createHandlers(
        (c) => c.json({ 'data': StateManager.getRooms() })
    ) 
};