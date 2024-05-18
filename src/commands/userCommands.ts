import { Room } from '~/models/room';
import { User } from '~/models/user';
import { StateManager } from '~/utils/stateManager';
import { State } from '~/models/state';

export function userCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');
    const room: Room = StateManager.rooms.get(state.roomCode) as Room;
    const user: User = state.user;
    if (!room) return;

    let response = null;

    const argArr = args.map((arg) => arg.trim());
    switch (op) {
        case 'set':
            response = user.setUserData(argArr[0], argArr[1]);
            break;
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