import { State } from '~/models/state';
import { rooms, createRoom } from '~/utils/stateManager';
import { Room } from '~/models/room';
import { User } from '~/models/user';

export function messageCommands(state: State, message: string) {
    if (!message.trim()) return; // empty message, just ignore

    const room: Room = rooms.get(state.roomCode); // get the room
    // send message to everyone on the room
    room.getUsers().forEach(({ socket }) => {
        socket.send(
            `${state.user.getUsername()}: ${message}`
        );
    });
}