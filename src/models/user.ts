import { ServerWebSocket } from 'bun';
import { Rand } from '../utils/randomizer';
import { UserStatus, UserCosmetics, Connection, Role } from '../models/dto/userDTO';
import { WebSocketData } from '../utils/common';
import { Deck } from './deck';

export class User {
    socket: ServerWebSocket<WebSocketData>;
    username: string;
    id: string = Rand.id(56);
    role: Role;
    status: UserStatus;
    cosmetics: UserCosmetics;
    // private deck: Deck = new Deck();
    deck: Deck = new Deck();

    constructor(socket: ServerWebSocket<WebSocketData>) {
        this.socket = socket;
        this.status = {
            connection: Connection.Active,
            last_seen: Date.now()
        };
        this.cosmetics = {
            color: Rand.color(),
            avatar: null,
            team: null
        };
        this.role = Role.Player;
    }

    // Role related methods
    setRole(role: Role): void {
        this.role = role;
    }

    getRole(): Role {
        return this.role;
    }

    isAdmin(): boolean {
        return this.getRole() === Role.Admin;
    }
    // Role related methods END

    getInfo(): string {
        return JSON.stringify({
            id: this.id,
            username: this.username,
            status: this.status,
            cosmetics: this.cosmetics,
            role: this.role
        });
    }

    /**
     * Updates the last seen timestamp with the current time.
     */
    beatHeart(): void {
        this.status.last_seen = Date.now();
    }

    /**
     * Gets the last beat of the user.
     * @returns The last seen timestamp of the user, in milliseconds since the Unix epoch.
     */
    getLastBeat(): number {
        return this.status.last_seen;
    }

    getSocket(): ServerWebSocket<WebSocketData> {
        return this.socket;
    }

    setSocket(socket: ServerWebSocket<WebSocketData>): void {
        this.socket = socket;
    }

    getConnectionStatus(): Connection {
        return this.status.connection;
    }

    setConnectionStatus(status: Connection): void {
        global.log('User connection status changed to ' + Connection[status]);
        this.status.connection = status;
    }

    getUsername(): string {
        return this.username;
    }

    setUsername(newUsername: string): string {
        const currentUsername = this.username;
        this.username = newUsername;
        return `Username changed from ${currentUsername} to ${newUsername}`;
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

    getTeam(): string | null {
        return this.cosmetics.team;
    }

    setTeam(teamId: string | null): void {
        this.cosmetics.team = teamId;
    }

    // analogy: user leaves the room for a bit, but they can come back, so we keep them for now
    userLeaveRoom(): void {
        global.log(`User ${this.username} left the room at ${new Date().toISOString()}`);
        this.status.last_seen = Date.now(); // keep this value so that we can remove the user if they don't come back after a while
        this.setConnectionStatus(Connection.Away);
    }

    // User has effectively left the room, we can safely remove them
    quitRoom(): void {
        this.setConnectionStatus(Connection.Exited);
    }

    /**
     * Sets the value of a specific key in the user data.
     * If the key is a valid property of the user object, it sets the value directly.
     * If the key is not a valid property, it attempts to call a setter method with the same name as the key.
     * If a setter method exists, it calls the method with the provided value.
     * If neither a valid property nor a setter method is found, it does nothing.
     *
     * @param key - The key of the user data to set.
     * @param value - The value to set for the specified key.
     * @returns True if the key is valid and the value was set, false otherwise.
     */
    setUserData(key: string, value: any): boolean {
        // check if the key is valid
        if (key in this) {
            // this.settings[key] = value;
            const method = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof this[method] === 'function') {
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

    // Avatar related methods
    getAvatar(): string | null {
        return this.cosmetics.avatar;
    }

    setAvatar(avatar: string): boolean {
        this.cosmetics.avatar = avatar;
        return true;
    }

    removeAvatar(): void {
        this.cosmetics.avatar = null;
    }

}