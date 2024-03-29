import {
	broadcastMessage,
	chooseNickname,
	chooseRoom,
	leaveRoom,
} from "./utils/message.js";
import { createState, getState } from "./utils/state.js";

const stateMap = new Map();

type WebSocketData = {
	roomId: string;
	userId: string;
	isDebug: boolean;
};

Bun.serve<WebSocketData>({
	fetch(req, server) {
		return server.upgrade(req, {
			data: {
				roomId: new URL(req.url).searchParams.get("roomId"),
				userId: new URL(req.url).searchParams.get("userId"),
				isDebug: new URL(req.url).searchParams.get("debug") ? true : false,
			},
		});
	},
	websocket: {
		idleTimeout: 600, // 10 minutes
		maxPayloadLength: 2048 * 1024, // 2 MiB
		open(ws) {
			console.log(ws.data);
			// Throwing back debug info
			if (ws.data.isDebug) {
				ws.send(`Query roomId: ` + ws.data.roomId);
				ws.send(`Query userId: ` + ws.data.userId);
			}

			let state;
			if (ws.data.userId && ws.data.roomId) {
				state = getState(ws, ws.data.userId, ws.data.roomId);
				ws.send(`u: ` + state.user.getId());
			}
			if (!state) {
				// If reconnection failed or wasn't attempted, create a new user
				state = createState(ws);
				ws.send("Enter room code");
			}
			stateMap.set(ws, state);
		},
		message(ws, message) {
			const state = stateMap.get(ws); // Retrieve the state from the Map
			const messageString = message.toString();

			switch (state.status) {
				case "ROOM":
					return chooseRoom(messageString, state);
				case "NICKNAME":
					return chooseNickname(messageString, state);
				default:
					return broadcastMessage(messageString, state);
			}
		},
		ping(ws, data) {
		},
		close(ws, code, message) {
			let state = stateMap.get(ws);
			leaveRoom(state);
			stateMap.delete(ws);
		},
		drain(ws) {
		},
	},
	port: Number(process.env.PORT || 3000),
});