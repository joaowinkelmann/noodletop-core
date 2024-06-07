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
        case 'roomCode':
            const generatedRoomCode = Rand.roomCode();
            response = `Generated room code: ${generatedRoomCode}`;
            break;
        default:
            response = `Invalid operation`;
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}