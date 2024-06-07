// Common utility functions

import { User } from '../models/user';
import { Role } from '../models/dto/userDTO';

export function isJSON(str: string): boolean {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Represents the data structure for WebSocket communication and reconnecting.
 * @roomCode - The room code.
 * @userId - The connected user's ID.
 * @ip - The IP address of the connected user.
 */
export type WebSocketData = {
    roomCode: string | null;
    userId: string | null;
    ip: string;
};

/**
 * Parses the headers and extracts the userId and roomCode.
 *
 * @param headers - The headers object containing the userId and roomCode.
 * @returns An array containing the userId and roomCode, or [null, null] if an error occurs.
 */
export const parseHeaders = (headers: Headers): [string | null, string | null] => {
    try {
        const userId = headers.get('userId');
        const roomCode = headers.get('roomCode');
        return [userId, roomCode];
    }
    catch (e) {
        return [null, null];
    }
};

export const isAdmin = (user: User): boolean => {
    return user.getRole() === Role.Admin;
};

/**
 * Styling helper for bash output.
 */
export const shCss = {
    // Colors
    red: '\u001b[1;31m',
    green: '\u001b[1;32m',
    yellow: '\u001b[1;33m',
    blue: '\u001b[1;34m',
    magenta: '\u001b[1;35m',
    cyan: '\u001b[1;36m',
    lgray: '\u001b[1;37m',
    dgray: '\u001b[1;90m',
    orange: '\u001b[1;91m',

    // Text effects
    end: '\x1b[0m', // resets the color
    bold: '\u001b[1m',
    underline: '\u001b[4m',
    italic: '\u001b[3m'

    // Background colors
    // bgRed: '\u001b[41m',
    // bgGreen: '\u001b[42m',
    // bgYellow: '\u001b[43m',
    // bgBlue: '\u001b[44m',
    // bgMagenta: '\u001b[45m',
    // bgCyan: '\u001b[46m',
    // bgLgray: '\u001b[47m',
    // bgDgray: '\u001b[100m',
    // bgOrange: '\u001b[101m',
};