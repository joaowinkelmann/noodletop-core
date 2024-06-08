import { Room } from '../models/room';
import { StateManager } from '../utils/stateManager';
import { State } from '../models/state';
import { isJSON } from '../utils/common';

export const listeners = [
    '/deck'
];

export const helpString = '/deck - Manages your deck.';

export default function deck(state: State, input: string) {
    const [command, op, ...args] = input.split(' ');

    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    if (!room) return;

    let response: string;

    const deck = state.user.deck;

    switch (op) {
        case 'add':
            // deck.addToDeck(args[0]);
            let props: Record<string, any> = {};
            if (args.length > 1 && isJSON(args[1])) {
                props = JSON.parse(args[1]);
            }
            deck.addToDeck(state.user.getId(), args[0], props);
            response = 'Added to deck';
            break;
        case 'get':
            response = deck.getDeck();
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    if (response) {
        state.user.getSocket().send(JSON.stringify({response}));
    }
}