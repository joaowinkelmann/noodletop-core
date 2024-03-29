import {
	broadcastMessage,
	chooseNickname,
	chooseRoom,
	leaveRoom,
} from "./utils/message.js";
import { createState, getState, parseCookies } from "./utils/state.js";

const stateMap = new Map();

type WebSocketData = {
	roomCode: string | null;
	userId: string | null;
	isDebug: boolean;
};

Bun.serve<WebSocketData>({
	fetch(req, server) {
		console.log(JSON.stringify(req.headers, null, 2));
		const cookies = req.headers.get("cookie") ?? "";
		const [user, room] = parseCookies(cookies);
		const success = server.upgrade(req, {
			data: {
				roomCode: room,
				userId: user,
				isDebug: req.url.searchParams.get("debug") === "true" ? true : false,
			}
		});

		if (success) {
			return undefined;
		}

		return Response.redirect("/");
	},
	websocket: {
		idleTimeout: 600, // 10 minutes
		maxPayloadLength: 2048 * 1024, // 2 MiB
		open(ws) {
			// Throwing back debug info
			if (ws.data.isDebug) {
				ws.send(`d:roomCode: ` + ws.data.roomCode);
				ws.send(`d:userId: ` + ws.data.userId);
			}

			let state;
			if (ws.data.userId && ws.data.roomCode) {
				state = getState(ws, ws.data.userId, ws.data.roomCode);
			}
			if (!state) {
				// If reconnection failed or wasn't attempted, create a new user
				state = createState(ws);
				ws.send("Enter room code");
			} else {
				ws.send(`u: ` + state.user.getId());
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