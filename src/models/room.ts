import { User } from "./user";
import { ObjectManager } from "./object";
import { Rand } from "../utils/randomizer";
import { RoomSettings } from "../dto/roomDTO";

/**
 * Class representing a room, containing a set of users and objects.
 */
export class Room {
	private users: Set<User>;
	private objects: ObjectManager = new ObjectManager();
	private roomCode: string;
	private roomSessionId: string;
	private status: string = "active"; // active, inactive, closed
	private last_seen: number;
	private settings: RoomSettings;

	/**
	 * @param roomCode - The unique code for the room
	 * @param isPublic - Whether the room is public (can be seen by anyone) or private (can only be joined by invitation)
	 * @param capacity - The maximum number of users that can be in the room at once. If null, there is no limit.
	 */
	constructor(
		roomCode: string,
		isPublic: boolean = true,
		capacity: number = 20,
	) {
		this.roomCode = roomCode;
		this.users = new Set();
		this.settings = {
			isPublic,
			capacity
		};
		this.roomSessionId = Rand.id(16);
		this.last_seen = Date.now();
		this.status = "active";
	}

	// standard properties
	getCapacity(): number {
		return this.settings.capacity;
	}

	setCapacity(capacity: number) {
		this.settings.capacity = capacity;
	}

	getCode(): string {
		return this.roomCode;
	}

	getRoomInfo(): string {
		return JSON.stringify({
			roomSessionId: this.roomSessionId,
			settings: this.settings,
			roomCode: this.roomCode,
			users: Array.from(this.users).map((user) => user.getUsername()),
			objects: this.objects.getAll(),
			status: this.status,
		});
	}

	// CRUD operations for users
	addUser(user: User) {
		this.users.add(user);
	}

	disconnectUser(user: User, remove: boolean, code: number = 1000, reason: string | undefined = undefined) {
		user.getSocket().close(code, reason);
		if (remove) {
			this.removeUser(user);
		}
	}

	removeUser(user: User) {
		this.users.delete(user);
	}

	getUsers(): Set<User> {
		return this.users;
	}

	countUsers(): number {
		return this.users.size;
	}

	// Method to get a single user by its ID, used for recconecting a user back to a room
	getUserById(id: string): User | undefined {
		return Array.from(this.users).find((user) => user.getId() === id);
	}

	// CRUD operations for objects
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

	heartbeat(user: User): void {
		this.last_seen = Date.now();
		user.userHeartbeat();
	}

	getLastSeen(): number {
		return this.last_seen;
	}

	selfDestruct(): void {
		this.users.forEach((user) => {
			this.disconnectUser(user, true, 4001, "Room closed");
		});
		//this.objects.deleteAll();
		//this.status = "closed";
	}
}
