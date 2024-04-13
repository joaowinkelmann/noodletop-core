// Class to manage the state of the user, room, and socket connections
import { User } from "../models/user";
import { Room } from "../models/room";
import { State } from "../models/state";
import { Sweeper } from "./sweeper";
import { ServerWebSocket } from "bun";

/**
 * Creates a new state.
 * @param socket - The server WebSocket.
 * @param username - The username (optional).
 * @returns The new state object.
 */
export const createState = (socket: ServerWebSocket<unknown>, username: string | null = null): State => ({
	status: "ROOM",
	roomCode: null,
	user: new User(socket, username)
});

/**
 * Retrieves the state of a user in a room. Used to reconnect a user to a room, for example.
 * @param socket - The newly assigned WebSocket connection.
 * @param userId - The ID of the user.
 * @param roomCode - The code of the room.
 * @returns The state of the user in the room, or null if the room or user was not found.
 */
export const getState = (socket: ServerWebSocket<unknown>, userId: string, roomCode: string): State | null => {
	const room = rooms.get(roomCode);
	if (!room) {
		return null;
	}
	const user = room.getUserById(userId);

	if (!room || !user) {
		return null;
	}

	// disconnect the old socket
	if (user.socket.readyState === WebSocket.OPEN) {
		user.socket.close(4007, "User reconnected");
	}

	user.socket = socket; // update the found user with the new socket to be used
	return {
		status: "CONNECTED",
		roomCode,
		user
	};
}

/**
 * Parses the headers and extracts the userId and roomCode.
 * 
 * @param headers - The headers object containing the userId and roomCode.
 * @returns An array containing the userId and roomCode, or [null, null] if an error occurs.
 */
export const parseHeaders = (headers: Headers): [string, string] | [null, null] => {
	try {
		const userId = headers.get("userId");
		const roomCode = headers.get("roomCode");
		return [userId, roomCode];
	}
	catch (e) {
		return [null, null];
	}
}

/**
 * Keeps the WebSocket connection alive by sending periodic ping messages.
 * @param socket - The WebSocket connection.
 * @param interval - The interval (in seconds) between each ping message. Default is 30 seconds.
 */
export const keepAlive = (socket: ServerWebSocket<unknown>, interval: number = 30) => {
	const intervalId = setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.ping();
		} else {
			clearInterval(intervalId);
		}
	}, interval * 1000);
}

export const createRoom = (roomCode: string): Room => {
	const room = new Room(roomCode);
	rooms.set(roomCode, room);
	return room;
}


class ObservableMap extends Map {
    constructor(private callback: Function) {
        super();
    }

    set(key, value) {
        const result = super.set(key, value);
        this.callback();
        return result;
    }

    delete(key) {
        const result = super.delete(key);
        this.callback();
        return result;
    }
}

export const rooms = new ObservableMap(() => {
    Sweeper.sweepInactiveUsers(rooms)
	Sweeper.sweepInactiveRooms(rooms)
});