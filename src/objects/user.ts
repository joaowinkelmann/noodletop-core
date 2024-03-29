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
	
	getSocket(): ServerWebSocket<unknown> {
		return this.socket;
	}

	getUsername(): string {
		return this.username;
	}

	getId(): string {
		return this.id;
	}

	changeUsername(newUsername: string): string {
		let currentUsername = this.username;
		this.username = newUsername;
		return `Username changed from ${currentUsername} to ${newUsername}`;
	}
	
}