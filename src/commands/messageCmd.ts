// "Converts" commands onto regular messages, either used to mask the command or to send a message to the room.
import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';
import { Room } from '~/models/room';

export const listeners = [
    '/msg'
];

export const helpString = false;

export default function message(state: State, input: string) {
    if (!input.trim()) return; // empty message, just ignore

    const room: Room = StateManager.getInstance().getRoom(state.roomCode); // get the room
    // send message to everyone on the room
    room.announce(`m ${state.user.getUsername()}: ${input}`);
}