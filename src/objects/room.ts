import { User } from "./user";
import { rObject, ObjectManager } from "./object";

/**
 * Class representing a room, containing a set of users and objects.
 */
export class Room {
	private users: Set<User>;
	private roomCode: string;
	private capacity: number | undefined;
	private isPublic: boolean;
	private objects: ObjectManager = new ObjectManager();

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

	// CRUD operations for users
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

	// CRUD operations for objects
	// createObj(properties?: string | undefined): string {
	createObj(type?: string, properties?: string): string {
		return this.objects.create(type, properties);
	}

	getObj(id: string): string | undefined {
		return this.objects.get(id);
	}

	getAllObj(): string | undefined {
		return this.objects.getAll();
	}

	updateObj(id: string, properties?: string): string {
		return this.objects.update(id, properties);
	}

	deleteObj(id: string): boolean {
		return this.objects.delete(id);
	}
}
