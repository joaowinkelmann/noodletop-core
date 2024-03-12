import { ServerWebSocket } from "bun";
import { Rand } from "~/utils/randomizer";

export class User {
	socket: ServerWebSocket<unknown>;
	username: string;
	id: string = Rand.id();

	constructor(socket: ServerWebSocket<unknown>, username: string) {
		this.socket = socket;
		this.username = username;
	}

	changeUsername(newUsername: string): string {
		let currentUsername = this.username;
		this.username = newUsername;
		return `Username changed from ${currentUsername} to ${newUsername}`;
	}
	
}