import { ask, info, logState, playerCount, reset } from "./log.js";
import { isJSON } from "./common.js";
import { Rand } from "./randomizer.js";
import { State, rooms } from "./state.js";

import { Room } from "../models/room.js";

export function chooseRoom(message: string, state: State) {
	state.roomCode = message.trim().toUpperCase();
	if (state.roomCode.length < 3)
		return ask(state.user.socket, "Room Code", true);
	state.status = "NICKNAME";
	ask(state.user.socket, "your Nickname");
}

export function chooseNickname(message: string, state: State) {
	const { roomCode, user } = state;
	const username = message.trim();
	if (username.length < 3) return ask(user.socket, "your Nickname", true);
	user.changeUsername(username);

	if (!rooms.has(roomCode)) {
		// the room does not exist, create it
		rooms.set(roomCode, new Room(roomCode));
	}

	const room = rooms.get(roomCode);
	room.addUser(user);
	// room.forEach(({ socket }) => {
	room.getUsers().forEach(({ socket }) => {
		if (socket !== user.socket) { // the other users
			socket.send(
				`${user.username} joined the room`
			);
		} else { // the user itself (private info goes here)
			// if the user is the first to join, send the room information
			socket.send(info(roomCode, room));
			// sending user id so that it may be saved by the client
			socket.send(`u: ${user.id}`);
		}
	});
	state.status = "CONNECTED";
	logState();
}

const commands = {
	"/help": {
		desc: "Command list",
		command({ user }: State) {
			user.socket.send(
				`Available commands: \r\n\t${Object.entries(
					commands
				)
					.map(([k, v]) => [k, v.desc].join(` \t`))
					.join(`\r\n\t`)} \r\n}>`
			);
		},
	},
	"/info": {
		desc: "Room information",
		command({ roomCode, user }: State) {
			user.socket.send(rooms.get(roomCode).getRoomInfo());
		},
	},
	"/list": {
		desc: "Room user list",
		command({ roomCode, user }: State) {
			const room = rooms.get(roomCode);
			user.socket.send(
				`${playerCount(room.getUsers().size)}: ${[
					...room.getUsers(),
				]
					.map((user) => user.username)
					.join(``)} >`
			);
		},
	},
	"/quit": {
		desc: "Quit the room",
		command(state: State) {
			rooms.get(state.roomCode).disconnectUser(state.user, true, 4900, "/quit");
		},
	},
	"/leave": {
		desc: "Leave the room temporarily",
		command(state: State) {
			state.user.userLeaveRoom(); // set away status
			rooms.get(state.roomCode).disconnectUser(state.user, false, 4100, "/leave");
		},
	},
	"/broadcast": {
		desc: "Send a message to all connected sockets",
		command(state: State, message: string) {
			rooms.forEach((room) => {
				room.getUsers().forEach(({ socket }) => {
					socket.send(
						`${state.user.username}: ${reset} ${message}`
					);
				});
			});
		},
	},
	"/obj": {
		desc: 'Documentation: https://t.ly/daGAP\nPerform operations with objects. Usage: /obj [read|create|update|delete] [id] [{"property": "value"}]',
		command(state: State, operation: string) {
			const room = rooms.get(state.roomCode);
			if (!room) return;

			let response = null;

			// get the operation
			const [op, ...args] = operation.split(" ");
			switch (op) {
				case "read":
				case "r":
					response = room.getObj(args[0]);
					break;
				case "readall":
					response = room.getAllObj();
					break;
				case "update":
				case "u":
					let id = args.shift();
					let properties = null;

					if (isJSON(args.join(" ")) === false) {
						response = "Invalid JSON properties";
						break;
					} else {
						properties = JSON.parse(args.join(" "));
					}
					response = room.updateObj(id, properties);
					break;
				case "delete":
				case "d":
					response = room.deleteObj(args[0]);
					break;
				case "create":
				case "c":
					// Call the createObject method on the instance

					let type = args.shift(); //get type as first argument
					let props = null;

					if (isJSON(args.join(" "))) {
						props = JSON.parse(args.join(" "));
					}

					response = room.createObj(type, props);
					break;
				default:
					response = "Invalid operation";
					break;
			}

			room.getUsers().forEach(({ socket }) => {
				socket.send(
					`${state.user.username} >${reset} ${response}`
				);
			});
		},
	},
	"/roll": {
		desc: "Roll dice. Usage: /roll [dice notation (2d6+3)] [show rolls (true|false)]",
		command(state: State, operation: string) {
			let diceNotation = operation.split(" ")[0];
			let showRolls = operation.split(" ")[1] === "false" ? false : true;

			let result = Rand.roll(diceNotation, showRolls);
			// send the result to the user
			state.user.socket.send(
				`${state.user.username} >${reset} ${result}`
			);
		},
	},
	"/usr": {
		desc: "Perform operations with your own user. Usage: /usr [changeUsername] [newUsername]\n || /usr info",
		command(state: State, operation: string) {
			const room = rooms.get(state.roomCode);
			if (!room) return;

			let response = null;

			// get the operation
			const [op, ...args] = operation.split(" ");
			switch (op) {
				case "changeUsername":
					response = state.user.changeUsername(args[0]);
					break;
				case "info":
					response = state.user.getInfo();
					break;
				default:
					response = "Invalid operation";
					break;
			}

			room.getUsers().forEach(({ socket }) => {
				socket.send(
					`${state.user.username} >${reset} ${response}`
				);
			});
		},
	},
};

export function broadcastMessage(message: string, state: State) {
	// updating last_seen on user and room
	rooms.get(state.roomCode).heartbeat(state.user);

	if (message.startsWith("/") && message.length > 1) {
		const command = message.split(" ")[0];
		const commandArgs = message.slice(command.length + 1);
		if (commands.hasOwnProperty(command)) {
			commands[command].command(state, commandArgs);
			return;
		}
	}

	rooms
		.get(state.roomCode)
		.getUsers()
		.forEach(({ socket }) => {
			socket.send(`${state.user.username}: ${reset} ${message}`);
		});
}