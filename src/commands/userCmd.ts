import { Room } from '../models/room';
import { User } from '../models/user';
import { StateManager } from '../utils/stateManager';
import { State } from '../models/state';

export const listeners = [
    '/user'
];

export const helpString = '/user - Manages user data.';

export default function user(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');
    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    const user: User = state.user;
    if (!room) return;

    let response: string;

    const argArr = args.map((arg) => arg.trim());
    switch (op) {
        case 'set':
            response = String(user.setUserData(argArr[0], argArr[1]));
            break;
        case 'setUsername':
            const username = argArr[0];
            if (username.length > 0) {
                response = state.user.setUsername(args[0]);
            } else {
                response = 'Invalid username';
            }
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