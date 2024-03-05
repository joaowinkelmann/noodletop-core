import { ask, blue, green, info, logState, playerCount, reset } from "./log.js";
import { State, rooms } from "./state.js";
import { Rand } from "./randomizer";

// import { ObjectManager, rObject } from "./objects/object.js";
import { Room } from "../objects/room.js";
// import { send } from "process";

export function leaveRoom(state: State) {
	if (!state) {
		throw new Error("State is undefined");
	}

	const { roomCode, user } = state;
	// rest of your code

	const room = rooms.get(roomCode);
	if (!room) return;
	if (user.socket.readyState === WebSocket.OPEN) {
		state.roomCode = null;
		state.status = "ROOM";
		ask(user.socket, "Room Code");
	}
	room.removeUser(user);
	// if (room.size === 0) rooms.delete(roomCode);
	if (room.getUsers().size === 0) rooms.delete(roomCode);
	// room.forEach(({ socket }) =>
	else
		room.getUsers().forEach(({ socket }) =>
			socket.send(
				`${blue}${user.username} ${green}left the room${blue}>${reset}`
			)
		);
	logState();
}

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
	// user.username = username;
	user.changeUsername(username);
	// if (!rooms.has(roomCode)) rooms.set(roomCode, new Set());

	if (!rooms.has(roomCode)) {
		// the room does not exist, create it
		rooms.set(roomCode, new Room(roomCode));
	}

	const room = rooms.get(roomCode);
	room.addUser(user);
	// room.forEach(({ socket }) => {
	room.getUsers().forEach(({ socket }) => {
		if (socket !== user.socket) {
			// alert the other users that a new user has joined
			socket.send(
				`${blue}${user.username}${green} joined the room ${blue}>${reset}`
			);
		} else {
			// if the user is the first to join, send the room information
			socket.send(info(roomCode, room));
		}
		// else socket.send(info(roomCode, room));
	});
	state.status = "CONNECTED";
	logState();
}

const commands = {
	"/help": {
		desc: "Command list",
		command({ user }: State) {
			user.socket.send(
				`${green}Available commands: \r\n\t${blue}${Object.entries(
					commands
				)
					.map(([k, v]) => [k, v.desc].join(` ${green}\t`))
					.join(`\r\n\t${blue}`)} \r\n${blue}>`
			);
		},
	},
	"/info": {
		desc: "Room information",
		command({ roomCode, user }: State) {
			user.socket.send(info(roomCode, rooms.get(roomCode)));
		},
	},
	"/list": {
		desc: "Room user list",
		command({ roomCode, user }: State) {
			const room = rooms.get(roomCode);
			user.socket.send(
				// `${playerCount(room.size)}: ${blue}${[...room.values()]
				`${playerCount(room.getUsers().size)}: ${blue}${[
					...room.getUsers(),
				]
					.map((user) => user.username)
					.join(`${green}, ${blue}`)} >`
			);
		},
	},
	"/quit": {
		desc: "Leave the room",
		command(state: State) {
			// send(state.user.socket, "You left the room"); // Bun não suporta send
			leaveRoom(state);
		},
	},
	"/broadcast": {
		desc: "Send a message to all connected sockets",
		command(state: State, message: string) {
			rooms.forEach((room) => {
				// room.forEach(({ socket }) => {
				room.getUsers().forEach(({ socket }) => {
					socket.send(
						`${blue}${state.user.username} >${reset} ${message}`
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
					// update example '/obj update NAGswjYK {"radius": 10, "color": "blue"}'
					// the id is the first argument, the properties are the second argument (as JSON string)
					let id = args.shift();

					let properties = null;

					if (isJSON(args.join(" ")) === false) {
						response = "Invalid JSON properties";
						break;
					} else {
						properties = JSON.parse(args.join(" "));
					}

					console.log(args.join(" "));
					console.log("properties", properties);
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
					`${blue}${state.user.username} >${reset} ${response}`
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
				`${blue}${state.user.username} >${reset} ${result}`
			);
		},
	},
	"/usr": {
		desc: "Perform operations with your own user. Usage: /usr [changeUsername] [newUsername]",
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
				default:
					response = "Invalid operation";
					break;
			}

			room.getUsers().forEach(({ socket }) => {
				socket.send(
					`${blue}${state.user.username} >${reset} ${response}`
				);
			});
		},
	},
};

export function broadcastMessage(message: string, state: State) {
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
			socket.send(`${blue}${state.user.username} >${reset} ${message}`);
		});
}

function isJSON(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
