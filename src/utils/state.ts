import { WebSocket } from "ws"
import { User } from "./user"
import { Room } from "./room"

export type State = {
	status: "ROOM" | "NICKNAME" | "CONNECTED";
	roomCode: string;
	user: User;
}

export type Socket = WebSocket & { isAlive: boolean }

export const newState = (socket: Socket): State => ({
	status: "ROOM",
	roomCode: null,
	user: {
		socket: socket,
		pseudo: null,
	},
})

export const rooms = new Map<string, Room>();