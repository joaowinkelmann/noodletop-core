import { ServerWebSocket } from "bun";
import { Rand } from "~/utils/randomizer";
import { UserStatusDTO } from "~/dto/UserStatus";

export class User {
	socket: ServerWebSocket<unknown>;
	username: string;
	id: string = Rand.id();
	status: UserStatusDTO;

	constructor(socket: ServerWebSocket<unknown>, username: string) {
		this.socket = socket;
		this.username = username;
		this.status = {
			connection: "active",
			last_seen: Date.now()
		};
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