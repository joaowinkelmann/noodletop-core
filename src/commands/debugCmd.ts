import { State } from '../models/state';
import { Rand } from '../utils/randomizer';

export const listeners = [
    '/debug'
];

export default function debug(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    let response: string;

    switch (op) {
        case 'dateFromId':
            const idString = args[0];
            const getMicro = args[1] === 'true' ? true : false;
            const date = Rand.dateFromId(idString, getMicro);

            if (date instanceof Date && !getMicro) {
                response  = `Date: ${date.toISOString()}`;
                response += `\nUnix: ${date.getTime()}`;
            } else {
                response = `Date: ${date}`;
            }

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
            const num = parseInt(args[0], 10);
            if (isNaN(num)) {
                response = `I'm afraid I can't do that, Dave.`;
                break;
            }
            response = Rand.toBase62(num);
            break;
        case 'fromBase62':
            const base62 = args[0];
            response = String(Rand.fromBase62(base62));
            break;
        case 'getName':
            const name = Rand.getName();
            response = `Generated name: ${name}`;
            break;
        default:
            response = `Invalid operation`;
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}