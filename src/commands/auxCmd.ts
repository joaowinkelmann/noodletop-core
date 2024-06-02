import { Rand } from '~/utils/randomizer';
import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';

export const listeners = [
    '/roll',
    '/ping'
];

export const helpString = [
    '/roll - Roll a dice. Usage: /roll [dice]'
];

export default function aux(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    let response = null;

    switch (command) {
        case '/roll':
            response = String(Rand.roll(op, true));
            break;
        // case '/listrooms':
        //     // response = StateManager.rooms;
        //     response = StateManager.getInstance().getRooms();
        //     break;
        // case '/listroom':
        //     // response = StateManager.rooms;
        //     response = StateManager.getInstance().getRoom(op);
        //     break;
        case '/ping':
            response = 'pong';
            break;
        default:
            response = 'Invalid command';
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}