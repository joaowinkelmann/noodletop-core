import { Socket, rooms } from "./state.js";
import { Room } from "./room";

export const blue = ">";
export const green = ">>";
export const reset = "";

export function ask(socket: Socket, item: string, error?: boolean) {
	if (error) {
		socket.send(`${green}Minimum length is 3 characters ${blue}>${reset}`);
	}
	socket.send(`${green}Enter ${item} ${blue}>${reset}`);
}

export const info = (roomCode: string, room: Room) =>
	`${green}Connected to room ${blue}${roomCode}${green} with ${playerCount(
		// room.size - 1
		room.getUsers().size - 1
	)} ${blue}>${reset}`;

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
	`${blue}${count > 0 ? count : "no"}${green} user${count !== 1 ? "s" : ""}`;
