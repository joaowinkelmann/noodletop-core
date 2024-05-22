import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';
import { Room } from '~/models/room';

/**
 * Manages an already established connection.
 * @param state
 * @param message
 * @returns
 */
export function connectionCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    const room: Room = StateManager.getRoom(state.roomCode); // get the room

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