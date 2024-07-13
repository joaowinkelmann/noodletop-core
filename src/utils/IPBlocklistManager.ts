import { ServerWebSocket } from 'bun';
import { State } from '../models/state';
import { WebSocketData } from './common';

export class IPBlocklistManager {
    private static ipBlocklist: Map<string, [Date, number]> = new Map();
    private static lockoutMins: number = parseInt(process.env.LOCKOUT_DURATION || "60", 10);
    private static allowedStrikes: number = parseInt(process.env.ALLOWED_STRIKES || "10", 10);

    /**
     * Checks the IP address of a socket and performs necessary actions if the IP is blocked.
     * @param socket - The socket containing the IP address information.
     * @returns void - The function will close the socket if the IP is blocked or invalid.
     */
    public static checkIP(socket: ServerWebSocket<WebSocketData>): void {
        const ip = socket.data.ip;
        if (!ip) {
            socket.close(4004, 'Unable to verify IP address');
        }
        const ipInfo = this.ipBlocklist.get(ip);
        if (ipInfo && ipInfo[0] > new Date(new Date().getTime() - 1000 * 60 * this.lockoutMins)) {
            socket.close(4003, 'Blocked IP');
        }
    }

    public static addStrike(state: State): void {
        const ip = state.user.getSocket().data.ip;
        const ipInfo = this.ipBlocklist.get(ip);
        const [blockedAt, strikes] = ipInfo ? ipInfo : [new Date(), 0];

        if (blockedAt && (new Date().getTime() - blockedAt.getTime()) < 1000 * 60 * this.lockoutMins) {
            if (strikes + 1 >= this.allowedStrikes) {
                state.user.getSocket().close(4003, 'Blocked IP');
                // Log or handle the block event
            } else {
                this.ipBlocklist.set(ip, [blockedAt, strikes + 1]);
                // Optionally log the strike addition
            }
        } else {
            this.ipBlocklist.set(ip, [new Date(), 1]);
            // Optionally log the strike addition
        }
    }

    public static blockIP(state: State): void {
        const ip = state.user.getSocket().data.ip;
        this.ipBlocklist.set(ip, [new Date(), this.allowedStrikes]);
        state.user.getSocket().close(4003, 'Blocked IP');
        // Log or handle the block event
    }

    public static unblockIP(state: State): void {
        const ip = state.user.getSocket().data.ip;
        this.ipBlocklist.delete(ip);
        // Optionally log the unblock event
    }
}