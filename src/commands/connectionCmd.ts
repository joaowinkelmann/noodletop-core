import { State } from '../models/state';
import { StateManager } from '../utils/stateManager';
import { Room } from '../models/room';

export const listeners = [
    '/quit',
    '/leave'
];

export const helpString = [
    '/quit - Willingly disconnect from the room.',
    '/leave - Leave the room temporarily, simulating the loss of connection.'
];

/**
 * Manages an already established connection.
 * @param state
 * @param message
 * @returns
 */
export default function connection(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');
    if (!state.roomCode) {
        return;
    }
    let room: Room | null;
    
    room = StateManager.getInstance().getRoom(state.roomCode);
    if (!room) {
        state.user.getSocket().send('{"err": "Room not found"}');
        return;
    }

    switch (command) {
        case '/quit':
            room.disconnectUser(state.user, true, 4900, '/quit');
            break;
        case '/leave':
            state.user.userLeaveRoom(); // set away status
            room.disconnectUser(state.user, false, 4100, '/leave');
            break;
        default:
            break;
    }
}