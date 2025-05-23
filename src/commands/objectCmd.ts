import { Room } from '../models/room';
import { StateManager } from '../utils/stateManager';
import { State } from '../models/state';
import { isJSON, isAdmin } from '../utils/common';

export const listeners = [
    '/obj'
];

export const helpString = '/obj - Manages objects in the room.';

export default function object(state: State, input: string) {
    const [command, op, ...args] = input.split(' ');

    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    if (!room) return;

    let response: string;

    switch (op) {
        case 'read':
        case 'r':
            const obj = room.getObj(args[0]);
            if (obj) {
                response = JSON.stringify(obj);
            } else {
                response = '{"err": "Object not found"}';
            }
            break;
        case 'readall':
            const objs = room.getAllObj();
            if (objs) {
                response = JSON.stringify(objs);
            } else {
                response = '{"err": "No objects found"}';
            }
            break;
        case 'update':
        case 'u':
            const id = args.shift();
            let properties: Record<string, any>;

            if (!id || isJSON(args.join(' ')) === false) {
                response = '{"err": "Invalid properties"}';
                break;
            } else {
                properties = JSON.parse(args.join(' '));
            }
            response = room.updateObj(id, properties);
            break;
        case 'delete':
        case 'd':
            response = String(room.deleteObj(args[0]));
            break;
        case 'create':
        case 'c':
            let type: string = '';
            let props: Record<string, any> = {};

            // Valid cases:
            // Case: /obj create type_without_props
            // Case: /obj create {"key": "value"}
            // Case: /obj create my_type {"key":"value"}

            if (args.length === 1) {
                type = args[0];
            } else if (args.length === 2) {
                type = args[0];
                if (isJSON(args[1]) === false) {
                    response = '{"err": "Invalid JSON properties"}';
                    break;
                } else {
                    props = JSON.parse(args[1]);
                }
            } else if (args.length > 2) {
                type = args[1];
                // minify the json string after the type, because we could have something like "type" {"key": "value"}
                const minifiedJson = args.slice(1).join(' ');
                // console.log(minifiedJson);
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