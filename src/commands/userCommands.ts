import { Room } from '~/models/room';
import { rooms } from '~/utils/stateManager';
import { State } from '~/models/state';
// import { isAdmin } from '~/utils/common';

export function userCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');
    const room: Room = rooms.get(state.roomCode) as Room;
    if (!room) return;

    let response = null;

    switch (op) {
        case 'setUsername':
            response = state.user.setUsername(args[0]);
            break;
        case 'info':
            response = state.user.getInfo();
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    // send the response to the user
    if (response) {
        state.user.getSocket().send(response);
    }
}