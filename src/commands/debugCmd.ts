import { State } from '~/models/state';
import { Rand } from '~/utils/randomizer';

export const listeners = [
    '/debug'
];

export default function debug(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    let response = null;

    switch (op) {
        case 'dateFromId':
            const idString = args[0];
            response = String(Rand.dateFromId(idString));
            response += `\nUnix: ${Rand.dateFromId(idString).getTime()}`;
            break;
        case 'getId':
            const length = parseInt(args[0], 10);
            if (isNaN(length) || length < 1 || length > 32768) {
                response = `I'm afraid I can't do that, Dave.`;
                break;
            }
            response = Rand.id(length);
            break;
        case 'toBase62':
            const number = parseInt(args[0], 10);
            if (isNaN(number)) {
                response = `I'm afraid I can't do that, Dave.`;
                break;
            }
            response = Rand.toBase62(number);
            break;
        case 'fromBase62':
            const base62 = args[0];
            response = Rand.fromBase62(base62);
            break;
        default:
            response = `Invalid operation`;
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}