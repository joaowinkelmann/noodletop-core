import { User } from './user';
import { TeamManager } from './team';
import { ObjectManager } from './object';
import { Rand } from '../utils/randomizer';
import { RoomSettings } from './dto/roomDTO';
import { Connection, Role } from './dto/userDTO';
import { Table } from './table';
import { RoomDataManager } from '../services/roomDataManager';

/**
 * Class representing a room, containing a set of users and objects.
 */
export class Room {
    private users: Set<User>;
    private objects: ObjectManager = new ObjectManager();
    private teams: TeamManager = new TeamManager();
    private table: Table = new Table(100, 100);
    private code: string;
    private sessionId: string;
    private status: string = 'active'; // active, inactive, closed
    private lastSeen: number; // timestamp
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
        if (this.settings.capacity && this.countUsers() >= this.settings.capacity) {
            return true;
        } else {
            return false;
        }
    }

    isEmpty(): boolean {
        return this.countUsers() === 0;
    }

    isPublic(): boolean {
        return this.settings.isPublic;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getCode(): string {
        return this.code;
    }


    getRoomTable(): Record<string, any> {
        return this.table.getTable();
    }

    getRoomInfo(): string {
        return JSON.stringify({
            sessionId: this.sessionId,
            settings: this.settings,
            code: this.code,
            // userCount: this.countUsers(),
            currentPlayers: this.countActiveUsers(),
            users: Array.from(this.users).map((user) => user.getUsername()),
            objects: this.objects.getAll(),
            // table: this.table,
            table: this.getRoomTable(),
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
    setRoomData(key: string, value: any): boolean {
        // check if the key is valid
        if (key in this.settings) {
            // this.settings[key] = value;
            const method = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof this[method] === 'function') {
                // return this[method](value);
                this[method](value);
                return true;
            } else {
                // this.settings[key] = value;
            }
        } else {
            // handle invalid keys (perhaps a message informing the user)
        }
        return false;
    }

    // CRUD operations for users
    addUser(user: User): boolean {
        // check username
        if (!this.isUsernameAvaliable(user.getUsername())) {
            return false;
        }

        this.users.add(user);
        return true;
    }

    isUsernameAvaliable(username: string): boolean {
        return !Array.from(this.users).find((user) => user.getUsername() === username);
    }

    getAvailableUsername(): string {
        let username = '';
        // let pattern = Rand.bool() ? 'cn' : 'nn';
        // username = Rand.getName(2, '', true, pattern);
        username = Rand.getName(2, '', true);
        while (!this.isUsernameAvaliable(username)) {
            this.getAvailableUsername();
        }
        return username;
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
     *  4002 - "Invalid state" : User was removed from the room due to a forbidden action
     *  4003 - "Blocked IP"  : User was removed from the room due to being blocked
     *  4004 - "Unable to verify IP address" : User was removed from the room due to an invalid IP address
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

    public deleteUser(user: User) {
        this.users.delete(user);
    }

    getUsers(): Set<User> {
        return this.users;
    }

    getUser(userId: string): User | undefined {
        return Array.from(this.users).find((user) => user.getId() === userId);
    }

    getActiveUsers(): Set<User> {
        // return new Set(Array.from(this.users).filter((user) => user.getConnectionStatus()));
        // return new Set(Array.from(this.users).filter((user) => user.getConnectionStatus() === Connection.Active));
        return new Set(Array.from(this.users).filter((user) => user.getConnectionStatus() !== Connection.Exited));
    }

    getAwayUsers(): Set<User> {
        return new Set(Array.from(this.users).filter((user) => user.getConnectionStatus() === Connection.Away));
    }

    countUsers(): number {
        return this.users.size;
    }

    countActiveUsers(): number {
        return this.getActiveUsers().size;
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
        if (!team) {
            return JSON.stringify({ err: 'Team not found' });
        }

        // change the User.id from inside each team member to be their current username.
        team.members = team.members.map((member) => {
            const user = this.getUserById(member);
            return user ? user.getUsername() : '';
        });

        return JSON.stringify(team);
    }

    leaveTeam(user: User): boolean {
        const teamId = user.getTeam();
        if (!teamId) {
            return false;
        }
        this.teams.leave(teamId, user.getId());
        user.setTeam(null);
        return true;
    }

    /**
     * Deletes a team from the room.
     * @param {string} teamId - The ID of the team to delete.
     * @returns {boolean} - Returns true if the team was successfully deleted, false otherwise.
     */
    deleteTeam(teamId: string, user: User): boolean {
        if (!this.isAdmin(user)) {
            // throw new Error('User does not have permission to delete teams');
            return false;
        }
        return this.teams.delete(teamId);
    }

    listTeams(): string {
        return this.teams.list();
    }

    // CRUD operations for objects
    createObj(type?: string, properties?: Record<string, any>, creator?: User): string {
        return this.objects.create(type, properties, creator?.id);
    }

    getObj(id: string): string | undefined {
        return this.objects.get(id);
    }

    getAllObj(): string | undefined {
        return this.objects.getAll();
    }

    updateObj(id: string, properties: Record<string, any>): string {
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

    getLastSeenDate(): Date {
        return new Date(this.lastSeen);
    }

    checkEmpty(): void {
        if (this.isEmpty()) {
            this.status = 'inactive';
            // @todo - save to storage
        }
    }

    async save(close: boolean = false): Promise<boolean>{
        // @todo - save to storage
        const ret = await RoomDataManager.saveRoom(this);

        global.log(`ret: ${ret}`);

        if (close) {
            this.status = 'closed';
        }

        // if (ret) {
        //     return JSON.stringify({ message: 'Room saved successfully' });
        // }

        return ret;
    }

    setPassword(password: string): boolean {
        this.settings.password = password;
        global.log(`Room ${this.code} is now password protected`);
        return true;
    }

    public isPasswordProtected(): boolean {
        return !!this.settings.password;
    }

    public checkPassword(password: string): boolean {
        return password === this.settings.password;
    }
}