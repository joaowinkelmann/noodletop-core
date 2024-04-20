import { ServerWebSocket } from 'bun';
import { Rand } from '~/utils/randomizer';
import { UserStatus, UserCosmetics, Connection, Role } from '~/dto/userDTO';

export class User {
    socket: ServerWebSocket<unknown>;
    username: string;
    id: string = Rand.id();
    role: Role;
    status: UserStatus;
    cosmetics: UserCosmetics;

    constructor(socket: ServerWebSocket<unknown>, username: string) {
        this.socket = socket;
        this.username = username;
        this.status = {
            connection: Connection.Active,
            last_seen: Date.now()
        };
        this.cosmetics = {
            color: Rand.color()
        };
        this.role = Role.Player;
    }

    setRole(role: Role): void {
        this.role = role;
    }

    getRole(): Role {
        return this.role;
    }

    getInfo(): string {
        return JSON.stringify({
            id: this.id,
            username: this.username,
            status: this.status,
            cosmetics: this.cosmetics
        });
    }

    userHeartbeat(): void {
        this.status.last_seen = Date.now();
        global.log(`heartbeat: ${this.username}`);
    }

    getSocket(): ServerWebSocket<unknown> {
        return this.socket;
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

}