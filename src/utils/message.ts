import { ask, blue, green, info, logState, playerCount, reset } from "./log.js";
import { State, rooms } from "./state.js";
import { WebSocket } from "ws";

// import { ObjectManager, rObject } from "./objects/object.js";
import { Room } from "../objects/room.js";

export function close(state: State) {
	const { roomCode, user } = state;
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
				`${blue}${user.pseudo} ${green}left the room${
					user.socket.isAlive ? "" : " (inactivity)"
				} ${blue}>${reset}`
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
	const pseudo = message.trim();
	if (pseudo.length < 3) return ask(user.socket, "your Nickname", true);
	user.pseudo = pseudo;
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
				`${blue}${user.pseudo}${green} joined the room ${blue}>${reset}`
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
					.map((user) => user.pseudo)
					.join(`${green}, ${blue}`)} >`
			);
		},
	},
	"/quit": {
		desc: "Leave the room",
		command(state: State) {
			close(state);
		},
	},
	"/globalecho": {
		desc: "Send a message to all connected sockets",
		command(state: State, message: string) {
			rooms.forEach((room) => {
				// room.forEach(({ socket }) => {
				room.getUsers().forEach(({ socket }) => {
					socket.send(
						`${blue}${state.user.pseudo} >${reset} ${message}`
					);
				});
			});
		},
	},
	"/obj": {
		desc: "Perform operations with objects. Usage: /obj [read|create|update|delete] [id] [properties]",
		command(state: State, operation: string) {
			const room = rooms.get(state.roomCode);
			if (!room) return;

			var response = null;

			// get the operation
			const [op, ...args] = operation.split(" ");
			switch (op) {
				case "read":
					response = room.getObj(args[0]);
					break;
				case "readall":
					response = room.getAllObj();
					break;
				case "update":
					// update example '/obj update NAGswjYK {"radius": 10, "color": "blue"}'
					// the id is the first argument, the properties are the second argument (as JSON string)
					let id = args.shift();
					let properties = JSON.parse(args.join(" "));
					console.log(args.join(" "));
					console.log("properties", properties);
					response = room.updateObj(id, properties);
					break;
				case "delete":
					response = room.deleteObj(args[0]);
					break;
				case "create":
				default:
					// Call the createObject method on the instance
					response = room.createObj();
					break;
			}

			room.getUsers().forEach(({ socket }) => {
				socket.send(
					`${blue}${state.user.pseudo} >${reset} ${response}`
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

	// rooms.get(state.roomCode).forEach(({ socket }) => {
	rooms
		.get(state.roomCode)
		.getUsers()
		.forEach(({ socket }) => {
			socket.send(`${blue}${state.user.pseudo} >${reset} ${message}`);
		});
}
