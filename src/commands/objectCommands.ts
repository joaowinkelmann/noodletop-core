import { Room } from '~/models/room';
import { StateManager } from '~/utils/stateManager';
import { State } from '~/models/state';
import { isJSON, isAdmin } from '~/utils/common';

export function objectCommands(state: State, message: string) {
    const [command, op, ...args] = message.split(' ');

    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
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
            let type = null;
            let props = null;

            // Valid cases:
            // Case: /obj create type_without_props
            // Case: /obj create {"key": "value"}
            // Case: /obj create my_type {"key":"value"}

            if (args.length === 1) {
                type = args[0];
            } else if (args.length === 2) {
                type = args[0];
                if (isJSON(args[1]) === false) {
                    response = 'Invalid JSON properties';
                    break;
                } else {
                    props = JSON.parse(args[1]);
                }
            } else if (args.length > 2) {
                type = args[1];
                // minify the json string after the type, because we could have something like "type" {"key": "value"}
                const minifiedJson = args.slice(1).join(' ');
                console.log(minifiedJson);
                if (isJSON(minifiedJson) === false) {
                    response = 'Invalid JSON properties';
                    break;
                } else {
                    props = JSON.parse(minifiedJson);
                }
            } else {
                response = 'Invalid operation';
                break;
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