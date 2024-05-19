import { Room } from '~/models/room';
import { StateManager } from '~/utils/stateManager';
import { RouteInterface } from '~/routes';

export const route: RouteInterface = {
    pathRegex: 'api/object/get/\\w+',
    method: 'get',
    handler: (req: Request) => {
        const roomCode = req.headers.get('roomCode');
        const userId = req.headers.get('userId');

        if (!roomCode || !userId) {
            return new Response('Missing required headers', { status: 400 });
        }

        // check the provided state
        if (!StateManager.isValidState(userId, roomCode)) {
            return new Response('Invalid state', { status: 400 });
        }

        const room = StateManager.getRoom(roomCode) as Room;

        if (!room) {
            return new Response('Room not found', { status: 404 });
        }

        // get the body of the request
        const body = req.json();

        return new Response(
            // room.createObj(
                // "teste",
                // "abc",
                // headers: {
                //     "content-type": "application/json"
                // }
            // }
            room.getAllObj()
        );
    }
};