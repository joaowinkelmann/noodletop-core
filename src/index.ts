import {
	broadcastMessage,
	chooseNickname,
	chooseRoom
} from "./utils/message.js";
import { createState, getState, parseHeaders, keepAlive } from "./utils/state.js";

const stateMap = new Map();

type WebSocketData = {
	roomCode: string | null;
	userId: string | null;
	isDebug: boolean;
};

Bun.serve<WebSocketData>({
	fetch(req, server) {
		const [user, room] = parseHeaders(req.headers);
		const success = server.upgrade(req, {
			data: {
				roomCode: room,
				userId: user,
				isDebug: new URL(req.url).searchParams.has("debug"),
			},
		});

		if (success) {
			return undefined;
		}

		return Response.redirect("/");
	},
	websocket: {
		maxPayloadLength: 2048 * 1024, // 2 MiB
		open(ws) {
			// Throwing back debug info
			if (ws.data.isDebug) {
				ws.send(`d:data: ${JSON.stringify(ws.data)}`);
			}
			let state;
			if (ws.data.userId && ws.data.roomCode) {
				state = getState(ws, ws.data.userId, ws.data.roomCode);
			}
			if (!state) {
				state = createState(ws);
				ws.send("Enter room code");
			} else {
				ws.send(`u: ` + state.user.getId());
			}
			stateMap.set(ws, state);
			keepAlive(ws);
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
		close(ws, code, message) {
			let state = stateMap.get(ws);
			// leaveRoom(state);
			state.user.userLeaveRoom();
			// stateMap.delete(ws);
		},
		ping(ws) { },
		pong(ws) { }
	},
	port: Number(process.env.PORT || 3000),
});