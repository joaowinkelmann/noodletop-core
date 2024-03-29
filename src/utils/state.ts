import { User } from "../objects/user";
import { Room } from "../objects/room";
import { ServerWebSocket } from "bun";

export type State = {
	status: "ROOM" | "NICKNAME" | "CONNECTED";
	roomCode: string;
	user: User;
};

export type Socket = WebSocket & { isAlive: boolean };

export const createState = (socket: ServerWebSocket<unknown>, username: string | null = null): State => ({
	status: "ROOM",
	roomCode: null,
	user: new User(socket, username)
});

// Method to reconnect a user by receiving a userId and roomCode
export const getState = (socket: ServerWebSocket<unknown>, userId: string, roomCode: string): State => {
	const room = rooms.get(roomCode);
	if (!room) {
		return createState(socket);
	}
	const user = room.getUserById(userId);

	if (!room || !user) {
		return createState(socket);
	}
	user.socket = socket;
	return {
		status: "CONNECTED",
		roomCode,
		user
	};
}

export const rooms = new Map<string, Room>();