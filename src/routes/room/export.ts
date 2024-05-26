// import { globalState } from '~/main';
import { RouteInterface } from '~/routes';
import { RoomDataManager } from '~/services/roomDataManager';
import { StateManager } from '~/utils/stateManager';
// import { StateManager } from '~/utils/stateManager';

// import { RouteManager } from '~/routes/routeManager';
// const routeManager = RouteManager.getInstance();

export const route: RouteInterface = {
    pathRegex: 'api/room/export/\\w+',
    method: 'get',
    handler: (req: Request) => {
        const roomId = req.url.split('/').pop();
        // const room = StateManager.getRoom(roomId);
        // const room = globalState.getRoom(roomId);
        // const room = routeManager.getStateManager();
        // const room = typeof(routeManager);
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