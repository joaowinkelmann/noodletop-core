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
            if (isNaN(length) || length < 1 || length > 32768) {
                response = `I'm afraid I can't do that, Dave.`;
                break;
            }
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