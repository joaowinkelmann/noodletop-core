import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';
import { Room } from '~/models/room';

export const listeners = [
    '/quit',
    '/leave'
];

export const helpString = [
    '/quit - Willingly disconnect from the room.',
    '/leave - Leave the room temporarily, simulating the loss of connection.',
    '/ping - Pong! Used to test latency while using a client.'
];

/**
 * Manages an already established connection.
 * @param state
 * @param message
 * @returns
 */
export default function connection(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    const room: Room = StateManager.getInstance().getRoom(state.roomCode); // get the room

    switch (command) {
        case '/quit':
            room.disconnectUser(state.user, true, 4900, '/quit');
            break;
        case '/leave':
            state.user.userLeaveRoom(); // set away status
            room.disconnectUser(state.user, false, 4100, '/leave');
            break;
        case '/ping':
            state.user.getSocket().send('pong');
            break;
        default:
            break;
    }
}