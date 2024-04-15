import { User } from './user';
import { TeamManager } from './team';
import { ObjectManager } from './object';
import { Rand } from '../utils/randomizer';
import { RoomSettings } from '../dto/roomDTO';

/**
 * Class representing a room, containing a set of users and objects.
 */
export class Room {
    private users: Set<User>;
    private objects: ObjectManager = new ObjectManager();
    private teams: TeamManager = new TeamManager();
    private roomCode: string;
    private roomSessionId: string;
    private status: string = 'active'; // active, inactive, closed
    private lastSeen: number;
    private settings: RoomSettings;

    /**
     * @param roomCode - The unique code for the room
     * @param isPublic - Whether the room is public (can be seen by anyone) or private (can only be joined by invitation)
     * @param capacity - The maximum number of users that can be in the room at once. If null, there is no limit.
     */
    constructor(
        roomCode: string,
        isPublic: boolean = true,
        capacity: number = 20
    ) {
        this.roomCode = roomCode;
        this.users = new Set();
        this.settings = {
            isPublic,
            capacity
        };
        this.roomSessionId = Rand.id(7);
        this.lastSeen = Date.now();
        this.status = 'active';
    }

    // standard properties
    getCapacity(): number {
        return this.settings.capacity;
    }

    setCapacity(capacity: number) {
        if (capacity < this.countUsers()) {
            // invalid capacity, we've got more users than the new capacity
            return false; // perhaps throw an error instead
        }
        return this.settings.capacity = capacity;
    }

    getCode(): string {
        return this.roomCode;
    }

    getRoomInfo(): string {
        return JSON.stringify({
            roomSessionId: this.roomSessionId,
            settings: this.settings,
            roomCode: this.roomCode,
            userCount: this.countUsers(),
            users: Array.from(this.users).map((user) => user.getUsername()),
            objects: this.objects.getAll(),
            status: this.status
        });
    }

    /**
     * Sets the value of a specific key in the room's settings.
     * If the key is valid, it calls the corresponding setter method.
     * If the setter method exists, it invokes the method with the provided value.
     * If the key is invalid or the setter method doesn't exist, it does nothing.
     *
     * @param key - The key of the setting to be updated.
     * @param value - The new value for the setting.
     */
    setRoomData(key: string, value: any): void {
        // check if the key is valid
        if (key in this.settings) {
            // this.settings[key] = value;
            const method = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof this[method] === 'function') {
                return this[method](value);
            } else {
                // this.settings[key] = value;
            }
        } else {
            // handle invalid keys (perhaps a message informing the user)
        }
    }

    // CRUD operations for users
    addUser(user: User): boolean {
        // check if the room is full before adding a user
        if (this.settings.capacity && this.countUsers() >= this.settings.capacity) {
            global.log(`Room ${this.roomCode} is full`);
            return false;
        }
        // check if the user with the same name is already in the room
        if (Array.from(this.users).find((u) => u.getUsername() === user.getUsername())) {
            global.log(`User ${user.getUsername()} is already in the room`);
            return false;
        }
        this.users.add(user);
        return true;
    }

    disconnectUser(user: User, remove: boolean, code: number = 1000, reason: string | undefined = undefined) {
        user.getSocket().close(code, reason);
        if (remove) {
            this.removeUser(user);
        }
    }

    // getUserTeam(user: User): string | undefined {
    //     return this.teams.getTeamByUser(user.getId());
    // }

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

    // CRUD operations for teams
    createTeam(name: string): string {
        return JSON.stringify(this.teams.create(name));
    }

    getTeam(teamId: string): string {
        return JSON.stringify(this.teams.get(teamId));
    }

    joinTeam(teamId: string, user: User): string {
        this.teams.join(teamId, user.getId());
        user.setTeam(teamId);
        return JSON.stringify(this.teams.get(teamId));
    }

    leaveTeam(user: User): string {
        const teamId = user.getTeam();
        this.teams.leave(teamId, user.getId());
        user.setTeam(null);
        return JSON.stringify(this.teams.get(teamId));
    }

    /**
     * Deletes a team from the room.
     * @param {string} teamId - The ID of the team to delete.
     * @returns {boolean} - Returns true if the team was successfully deleted, false otherwise.
     */
    deleteTeam(teamId: string): boolean {
        // TODO: Add admin privileges once user roles are implemented
        return this.teams.delete(teamId);
    }

    listTeams(): string {
        return this.teams.list();
    }

    // CRUD operations for objects
    createObj(type?: string, properties?: object): string {
        return this.objects.create(type, properties);
    }

    getObj(id: string): string | undefined {
        return this.objects.get(id);
    }

    getAllObj(): string | undefined {
        return this.objects.getAll();
    }

    updateObj(id: string, properties?: object): string {
        return this.objects.update(id, properties);
    }

    deleteObj(id: string): boolean {
        return this.objects.delete(id);
    }

    heartbeat(user: User): void {
        this.lastSeen = Date.now();
        user.userHeartbeat();
    }

    getLastSeen(): number {
        return this.lastSeen;
    }

    selfDestruct(): void {
        this.users.forEach((user) => {
            this.disconnectUser(user, true, 4001, 'Room closed');
        });
        // this.objects.deleteAll();
        // this.status = "closed";
    }
}