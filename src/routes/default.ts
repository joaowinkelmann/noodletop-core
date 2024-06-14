// Default route for when a specified route is not found

import { RouteInterface } from ".";

export const route: RouteInterface = {
    // pathRegex: '',
    // regex, is null i.e. localhost:3000/ || localhost:3000/index.html alike
    pathRegex: '',
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