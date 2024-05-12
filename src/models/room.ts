import { User } from './user';
import { TeamManager } from './team';
import { ObjectManager } from './object';
import { Rand } from '../utils/randomizer';
import { RoomSettings } from './dto/roomDTO';
import { Role } from './dto/userDTO';

import { Db } from '~/database';

/**
 * Class representing a room, containing a set of users and objects.
 */
export class Room {
    private users: Set<User>;
    private objects: ObjectManager = new ObjectManager();
    private teams: TeamManager = new TeamManager();
    private code: string;
    private sessionId: string;
    private status: string = 'active'; // active, inactive, closed
    private lastSeen: number;
    private settings: RoomSettings;

    /**
     * @param code - The unique code for the room
     * @param isPublic - Whether the room is public (can be seen by anyone) or private (can only be joined by invitation)
     * @param capacity - The maximum number of users that can be in the room at once. If null, there is no limit.
     */
    constructor(
        code: string,
        isPublic: boolean = true,
        capacity: number = 20
    ) {
        this.code = code;
        this.users = new Set();
        this.settings = {
            isPublic,
            capacity
        };
        this.sessionId = Rand.id(9);
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

    /**
     * Method that centralizes the logic for checking if a room is available for a user to join.
     * @todo - If necessary, check the state/user that's trying to join the room, to see if it's allowed to join. (perhaps for the public/private logic)
     */
    isAvaliable(): boolean {
        if (this.status === 'closed' || this.isFull()) {
            return false;
        }
        return true;
    }

    isFull(): boolean {
        return this.settings.capacity && this.countUsers() >= this.settings.capacity;
    }

    isEmpty(): boolean {
        return this.countUsers() === 0;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getCode(): string {
        return this.code;
    }

    getRoomInfo(): string {
        return JSON.stringify({
            sessionId: this.sessionId,
            settings: this.settings,
            code: this.code,
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
        // check if the user with the same name is already in the room
        if (Array.from(this.users).find((u) => u.getUsername() === user.getUsername())) {
            global.log(`User ${user.getUsername()} is already in the room`);
            return false;
        }
        this.users.add(user);
        return true;
    }

    promoteToAdmin(user: User): boolean {
        user.setRole(Role.Admin);
        return true;
    }

    isAdmin(user: User): boolean {
        return user.getRole() === Role.Admin;
    }

    /**
     * Disconnects a user from the room.
     * @param user - The user to disconnect.
     * @param remove - Indicates whether to remove the user from the room after disconnecting.
     * @param code - The WebSocket close code to send to the user's socket. Defaults to 1000.
     * @param reason - The reason for disconnecting the user.
     * Standard codes and reasons:
     *  4100 - "/leave"    : User briefly disconnected from the room using /leave
     *  4700 - "Inactivity": User was removed from the room due to inactivity
     *  4900 - "/quit"     : User quit the room using /quit
     * @doc https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    disconnectUser(user: User, remove: boolean, code: number = 1000, reason?: string) {
        user.getSocket().close(code, reason);
        if (remove) {
            this.handleUserExit(user);
            // this.removeUser(user);
        }
    }

    /**
     * Handles a user exiting the room for good, reassinging their belongings and removing them from the room.
     * @param userId - The ID of the user to remove from the room -> User.id
     */
    private handleUserExit(user: User): void {
        if (user) {
            user.quitRoom();

            this.objects.yieldOwnership(user.getId(), null);

            // this.removeUser(user);
        }
    }

    private removeUser(user: User) {
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

        const team = this.teams.get(teamId);

        // change the User.id from inside each team member to be their current username.
        team.members = team.members.map((member) => {
            const user = this.getUserById(member);
            return user ? user.getUsername() : '';
        });

        return JSON.stringify(team);
    }

    leaveTeam(user: User): string {
        const teamId = user.getTeam();
        if (!teamId) {
            return;
        }
        this.teams.leave(teamId, user.getId());
        user.setTeam(null);
        return JSON.stringify(this.teams.get(teamId));
    }

    /**
     * Deletes a team from the room.
     * @param {string} teamId - The ID of the team to delete.
     * @returns {boolean} - Returns true if the team was successfully deleted, false otherwise.
     */
    deleteTeam(teamId: string, user: User): boolean {
        if (!this.isAdmin(user)) {
            // throw new Error('User does not have permission to delete teams');
            return;
        }
        return this.teams.delete(teamId);
    }

    listTeams(): string {
        return this.teams.list();
    }

    // CRUD operations for objects
    createObj(type?: string, properties?: object, creator?: User): string {
        return this.objects.create(type, properties, creator.id);
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
        user.beatHeart();
    }

    /**
     * Sends a message to everyone inside the room
     * @param message - The message to be sent
     */
    announce(message: string): void {
        this.getUsers().forEach(({ socket }) => {
            socket.send(message);
        });
    }

    getLastSeen(): number {
        return this.lastSeen;
    }

    // selfDestruct(): void {
    //     this.users.forEach((user) => {
    //         this.disconnectUser(user, true, 4001, 'Room closed');
    //     });
    //     // "saveAllAndDie"
    //     // this.objects.deleteAll();
    //     // this.status = "closed";
    // }

    checkEmpty(): void {
        if (this.isEmpty()) {
            this.status = 'inactive';
            // @todo - save to storage
        }
    }

}