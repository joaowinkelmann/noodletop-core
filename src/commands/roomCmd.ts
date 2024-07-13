import { Room } from '../models/room';
import { StateManager } from '../utils/stateManager';
import { State } from '../models/state';

export const listeners = [
    '/room'
];

export const helpString = '/room - Perform operations within the room. Usage: /room [set|close|info|list|kick] [username]\n' +
    '\t\t/room set [key] [value] - Set a room data key to a value\n' +
    '\t\t/room info - Get room information\n' +
    '\t\t/room save - Save the room\n' +
    '\t\t/room setpassword [password] - Set a password for the room';


export default async function room(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');
    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    if (!room) return;

    let response: string;

    const argArr = args.map((arg) => arg.trim());
    switch (op) {
        case 'set':
            response = String(room.setRoomData(argArr[0], argArr[1]));
            break;
        case 'info':
            response = room.getRoomInfo();
            break;
        case 'save':
            response = String(await room.save());
            if (response === 'true') {
                response = 'Room saved';
            } else {
                response = 'Error saving room';
            }
            break;
        case 'setpassword':
            response = String(room.setPassword(argArr[0]));
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    // await for the response if it is a promise
    if (response as any instanceof Promise) {
        response = await response;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}