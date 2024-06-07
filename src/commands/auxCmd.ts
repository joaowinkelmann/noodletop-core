import { Rand } from '../utils/randomizer';
import { State } from '../models/state'

export const listeners = [
    '/roll'
];

export const helpString = [
    '/roll - Roll a dice. Usage: /roll [dice]'
];

export default function aux(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    let response: string;

    switch (command) {
        case '/roll':
            response = String(Rand.roll(op, true));
            break;
        default:
            response = 'Invalid command';
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}