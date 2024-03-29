import {
	broadcastMessage,
	chooseNickname,
	chooseRoom,
	leaveRoom,
} from "./utils/message.js";
import { newState } from "./utils/state.js";

const stateMap = new Map();

type WebSocketData = {
	userId: string;
};

Bun.serve<WebSocketData>({
	fetch(req, server) {
		server.upgrade(req, {
			data: {
				userId: new URL(req.url).searchParams.get("userId"),
			},
		});
	},
	websocket: {
		open(ws) {
			const state = newState(ws);
			stateMap.set(ws, state); // Store the state in the Map, associated with the ws object
			ws.send("Enter room code");
			// debug: userId
			ws.send(`Your sent userId was` + ws.data.userId ?? "undefined");
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