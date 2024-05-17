import { RouteInterface, factory } from '~/routes';
import { RoomDataManager } from '~/services/roomDataManager';

export const route: RouteInterface = {
    path: '/room/export/:id?',
    method: 'get',
    // print back the room id using the request params on the handlers
    // handlers: factory.createHandlers((c) => c.req.param('id')),
    // handlers: factory.createHandlers((c) => c.json({ "af":  c.req.param('id') })),
    handlers:
        factory.createHandlers(
            (c) =>
                c.json(
                    {
                        'data': RoomDataManager.roomExportApi(c.req.param('id'))
                    }
                )
        )
};