import { State } from '~/models/state';
import { rooms, createRoom } from '~/utils/stateManager';
import { Room } from '~/models/room';

export function messageCommands(state: State, message: string) {
    if (!message.trim()) return; // empty message, just ignore

    const room: Room = rooms.get(state.roomCode); // get the room
    // send message to everyone on the room
    room.announce(message);
}