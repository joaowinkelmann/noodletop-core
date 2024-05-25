import { RouteInterface } from '~/routes';
import { RoomDataManager } from '~/services/roomDataManager';

export const route: RouteInterface = {
    pathRegex: 'api/room/export/\\w+',
    method: 'get',
    handler: (req: Request) => {
        const roomId = req.url.split('/').pop();
        // const room = StateManager.getRoom(roomId);
        const room = RoomDataManager.roomExportApi(roomId);
        return new Response(
            JSON.stringify(room),
            {
                headers: {
                'content-type': 'application/json'
                }
            }
        );
    }
};