import { State } from '~/models/state';
import { Rand } from '~/utils/randomizer';

export function debugCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    let response = null;

    switch (op) {
        case 'dateFromId':
            const idString = args[0];
            response = String(Rand.dateFromId(idString));
            break;
        case 'getId':
            const length = parseInt(args[0], 10);
            response = Rand.id(length);
            break;
        default:
            response = `Invalid operation`;
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}