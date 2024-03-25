import { Socket, rooms } from "./state.js";
import { Room } from "../objects/room.js";
import { ServerWebSocket } from "bun";

export const reset = "";

export function ask(socket: ServerWebSocket<unknown>, item: string, error?: boolean) {
	if (error) {
		socket.send(`Minimum length is 3 characters ${reset}`);
	}
	socket.send(`Enter ${item}${reset}`);
}

export const info = (roomCode: string, room: Room) =>
	`Connected to room ${roomCode} with ${playerCount(
		// room.size - 1
		room.getUsers().size
	)} ${reset}`;

export const logState = () =>
	console.table(
		Object.fromEntries(
			[...rooms.entries()].map(([code, room]) => [
				code,
				room.getUsers().size,
			])
		)
	);

export const playerCount = (count: number) =>
	`${count > 0 ? count : "no"} user${count !== 1 ? "s" : ""}`;
