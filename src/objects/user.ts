import { ServerWebSocket } from "bun";
import { Rand } from "~/utils/randomizer";
import { UserStatus, UserCosmetics } from "~/dto/userDTO";

export class User {
	socket: ServerWebSocket<unknown>;
	username: string;
	id: string = Rand.id();
	status: UserStatus;
	cosmetics: UserCosmetics;	

	constructor(socket: ServerWebSocket<unknown>, username: string) {
		this.socket = socket;
		this.username = username;
		this.status = {
			connection: "active",
			last_seen: Date.now()
		};
		this.cosmetics = {
			color: Rand.color()
		};
	}

	getInfo(): string {
		return JSON.stringify({
			id: this.id,
			username: this.username,
			status: this.status,
			cosmetics: this.cosmetics
		});
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

	getColor(): string {
		return this.cosmetics.color;
	}

	setColor(newColor: string): void {
		this.cosmetics.color = newColor;
	}

	changeUsername(newUsername: string): string {
		let currentUsername = this.username;
		this.username = newUsername;
		return `Username changed from ${currentUsername} to ${newUsername}`;
	}

	// analogy: user leaves the room for a bit, but they can come back, so we keep them for now
	leaveRoom(): void {
		this.status.last_seen = Date.now(); // keep this value so that we can remove the user if they don't come back after a while 
		this.status.connection = "away";
	}

	// User has effectively left the room, we can safely remove them
	quitRoom(): void {
		this.status.connection = "exited";
	}
	
}