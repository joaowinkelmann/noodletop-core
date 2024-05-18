import { RouteInterface, factory } from '~/routes';
import { RoomDataManager } from '~/services/roomDataManager';
import { StateManager } from '~/utils/stateManager';
    // import { Room } from '~/models/room';

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
                        // 'data': RoomDataManager.roomExportApi(c.req.param('id'))
                        'requestedId': c.req.param('id'),
                        // 'data': StateManager.rooms.forEach((room) => {
                        //     if (room.getCode() == c.req.param('id')) {
                        //         return room.getRoomInfo()
                        //     }
                        // }),
                        'teste': 'teste125',
                        'room': StateManager.getRoom(c.req.param('id')),
                        'rooms': StateManager.getRooms()
                    }
                )
        )
};