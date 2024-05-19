// import { RouteInterface, factory } from '~/routes';

// export const route: RouteInterface = {
//     method: 'post',
//     handlers: factory.createHandlers((c) => c.json({ bar: 'bar' }))
// };

import { Room } from "~/models/room";
import { StateManager } from "~/utils/stateManager";
import { RouteInterface } from "~/routes";

export const route: RouteInterface = {
    pathRegex: "api/object/create/\\w+",
    // method: "post",
    method: "put",
    handler: (req: Request) => {
        const roomId = req.headers.get("roomId");
        const userId = req.headers.get("userId");

        if (!roomId || !userId) {
            return new Response("Missing required headers", { status: 400 });
        }

        // check the provided state
        if (!StateManager.isValidState(userId, roomId)) {
            return new Response("Invalid state", { status: 400 });
        }

        const room = StateManager.getRoom(roomId) as Room;

        if (!room) {
            return new Response("Room not found", { status: 404 });
        }

        //get the body of the request
        const body = req.json();

        return new Response(
            // room.createObj(
                // "teste",
                // "abc",
                // headers: {
                //     "content-type": "application/json"
                // }
            // }
        );
    }
};