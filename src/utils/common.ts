// Common utility functions

import { User } from '../models/user';
import { Role } from '~/models/dto/userDTO';

export function isJSON(str: string): boolean {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Parses the headers and extracts the userId and roomCode.
 *
 * @param headers - The headers object containing the userId and roomCode.
 * @returns An array containing the userId and roomCode, or [null, null] if an error occurs.
 */
export const parseHeaders = (headers: Headers): [string, string] | [null, null] => {
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