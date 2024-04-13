import { Room } from "../models/room.js";
import { ServerWebSocket } from "bun";

export function ask(socket: ServerWebSocket<unknown>, item: string, error?: boolean) {
	if (error) {
		socket.send(`Minimum length is 3 characters`);
	}
	socket.send(`Enter ${item}`);
}

export const info = (roomCode: string, room: Room) =>
	`Connected to room ${roomCode} with ${room.countUsers()} users`;