import { Rand } from '~/utils/randomizer';
import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';

export function auxCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    let response = null;

    switch (command) {
        case '/roll':
            response = String(Rand.roll(op, true));
            break;
        case '/listrooms':
            // response = StateManager.rooms;
            response = StateManager.getRooms();
            break;
        case '/listroom':
            // response = StateManager.rooms;
            response = StateManager.getRoom(op);
            break;
        default:
            response = 'Invalid command';
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}