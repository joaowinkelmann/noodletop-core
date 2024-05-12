import { Room } from '~/models/room';
import { rooms } from '~/utils/stateManager';
import { State } from '~/models/state';
import { isJSON, isAdmin } from '~/utils/common';

export function objectCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    const room: Room = rooms.get(state.roomCode) as Room;
    if (!room) return;

    let response = null;

    switch (op) {
        case 'read':
        case 'r':
            response = room.getObj(args[0]);
            break;
        case 'readall':
            response = room.getAllObj();
            break;
        case 'update':
        case 'u':
            const id = args.shift();
            let properties = null;

            if (isJSON(args.join(' ')) === false) {
                response = 'Invalid JSON properties';
                break;
            } else {
                properties = JSON.parse(args.join(' '));
            }
            response = room.updateObj(id, properties);
            break;
        case 'delete':
        case 'd':
            response = room.deleteObj(args[0]);
            break;
        case 'create':
        case 'c':
            // Call the createObject method on the instance

            const type = args.shift(); // get type as first argument
            let props = null;

            if (isJSON(args.join(' '))) {
                props = JSON.parse(args.join(' '));
            }

            response = room.createObj(type, props, state.user);
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    if (response) {
        room.announce(response);
    }
}