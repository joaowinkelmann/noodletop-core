import { builtinModules } from "module";
import { heartbeat, keepAlive } from "./utils/keepalive.js";
import { ask } from "./utils/log.js";
import {
	broadcastMessage,
	chooseNickname,
	chooseRoom,
	leaveRoom,
} from "./utils/message.js";
import { Socket, newState } from "./utils/state.js";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: Number(process.env.PORT) });

// wss.on("connection", (ws: Socket) => {
// 	const state = newState(ws)
// 	ask(ws, "Room Code")

// 	ws.on("message", (data) => {
// 		const message = data.toString()

// 		switch (state.status) {
// 			case "ROOM":
// 				return chooseRoom(message, state)
// 			case "NICKNAME":
// 				return chooseNickname(message, state)
// 			default:
// 				return broadcastMessage(message, state)
// 		}
// 	})

// 	ws.on("pong", heartbeat)
// 	ws.on("close", () => close(state))
// })

// const interval = keepAlive(wss)
// wss.on("close", () => clearInterval(interval))

// changing to use bun

// Create a Map to hold the state for each WebSocket connection
const stateMap = new Map();
const lastPingMap = new Map();

// testing with 'npx wscat -c ws://localhost:3000'
Bun.serve({
	fetch(req, server) {
		// upgrade logic
		if (server.upgrade(req)) {
			return;
		}
		// return new Response("Upgrade failed :(", { status: 500 });
		return new Response();
	},
	websocket: {
		open(ws) {
			const state = newState(ws);
			stateMap.set(ws, state); // Store the state in the Map, associated with the ws object
			ws.send(""

			// Set the initial ping time when the connection is opened
			lastPingMap.set(ws, Date.now());
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
			// Update the last ping time when a ping is received
			lastPingMap.set(ws, Date.now());
		},
		close(ws, code, message) {
			let state = stateMap.get(ws);
			leaveRoom(state);
			stateMap.delete(ws); // Remove the state from the Map when the WebSocket connection is closed
			lastPingMap.delete(ws); // Also remove the last ping time
		},
		drain(ws) {
			// Handle drain events
		},
	},
	port: Number(process.env.PORT || 3000),
});

// function keepAliveBun() {
// 	const now = Date.now();
// 	for (const [ws, lastPing] of lastPingMap) {
// 		if (now - lastPing > 30000) {
// 			ws.close();
// 		} else {
// 			ws.ping();
// 		}
// 	}
// }

// Set an interval to check for WebSocket connections that haven't sent a ping recently
// setInterval(() => {
// 	const now = Date.now();
// 	for (const [ws, lastPing] of lastPingMap.entries()) {
// 		// If the last ping was more than 30 seconds ago, close the connection
// 		if (now - lastPing > 30000) {
// 			ws.close(1000, "No heartbeat");
// 		}
// 	}
// }, 10000); // Check every 10 seconds
