import { User } from "./user";

/**
 * Class representing a room, containing a set of users.
 */
export class Room {
	private users: Set<User>;
	private roomCode: string;
	private capacity: number | undefined;
	private isPublic: boolean;

	/**
	 * @param roomCode - The unique code for the room
	 * @param isPublic - Whether the room is public (can be seen by anyone) or private (can only be joined by invitation)
	 * @param capacity - The maximum number of users that can be in the room at once. If null, there is no limit.
	 */
	constructor(
		roomCode: string,
		isPublic: boolean = true,
		capacity: number | undefined = undefined
	) {
		this.roomCode = roomCode;
		this.users = new Set();
		this.isPublic = isPublic;
		this.capacity = capacity;
	}

	addUser(user: User) {
		this.users.add(user);
	}

	removeUser(user: User) {
		this.users.delete(user);
	}

	getUsers(): Set<User> {
		return this.users;
	}

	getRoomCode(): string {
		return this.roomCode;
	}
}
