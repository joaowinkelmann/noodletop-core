import { State } from '../models/state';

export const listeners = [
    '/ping'
];

export const helpString = [
    '/ping - Pong! Used to test latency while using a client.'
];

export default function ping(state: State, input: string) {
    state.user.getSocket().send('pong');
}