import { ServerWebSocket } from 'bun';
import { Rand } from '~/utils/randomizer';
import { UserStatus, UserCosmetics, Connection, Role } from '~/models/dto/userDTO';
import { ObjectManager } from './object';

export class User {
    socket: ServerWebSocket<unknown>;
    username: string;
    id: string = Rand.id(24);
    role: Role;
    status: UserStatus;
    cosmetics: UserCosmetics;

    constructor(socket: ServerWebSocket<unknown>) {
        this.socket = socket;
        this.status = {
            connection: Connection.Active,
            last_seen: Date.now()
        };
        this.cosmetics = {
            color: Rand.color()
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

    getSocket(): ServerWebSocket<unknown> {
        return this.socket;
    }

    setSocket(socket: ServerWebSocket<unknown>): void {
        this.socket = socket;
    }

    setConnectionStatus(status: string): void {
        this.status.connection = status;
    }

    getUsername(): string {
        return this.username;
    }

    setUsername(newUsername: string): string {
        if (!newUsername) {
            return;
        }
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
        this.status.connection = Connection.Away;
    }

    // User has effectively left the room, we can safely remove them
    quitRoom(): void {
        this.status.connection = Connection.Exited;
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
     */
    setUserData(key: string, value: any): void {
        // check if the key is valid
        if (key in this) {
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

}