// import { globalState } from '~/main';
import { RouteInterface } from '../../routes';
import { RoomDataManager } from '../../services/roomDataManager';
import { StateManager } from '../../utils/stateManager';
// import { StateManager } from '~/utils/stateManager';

// import { RouteManager } from '~/routes/routeManager';
// const routeManager = RouteManager.getInstance();

export const route: RouteInterface = {
    pathRegex: 'api/room/export/\\w+',
    method: 'get',
    handler: (req: Request) => {
        const roomId = req.url.split('/').pop();
        if (!roomId) {
            return new Response(
                JSON.stringify({ error: 'Invalid room ID' }),
                {
                    headers: {
                    'content-type': 'application/json'
                    }
                }
            );
        }
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