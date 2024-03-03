import { User } from "../objects/user";
import { Room } from "../objects/room";
import { ServerWebSocket } from "bun";

export type State = {
	status: "ROOM" | "NICKNAME" | "CONNECTED";
	roomCode: string;
	user: User;
};

export type Socket = WebSocket & { isAlive: boolean };

export const newState = (socket: ServerWebSocket<unknown>): State => ({
	status: "ROOM",
	roomCode: null,
	user: new User(socket, "")
});

export const rooms = new Map<string, Room>();