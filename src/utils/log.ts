import { Room } from '../models/room.js';
import { ServerWebSocket } from 'bun';

export function ask(socket: ServerWebSocket<unknown>, item: string, errorText?: string) {
    if (errorText) {
        socket.send(errorText);
    }
    socket.send(`?${item}`);
}

export const info = (roomCode: string, room: Room) =>
    `Connected to room ${roomCode} with ${room.countUsers()} users`;