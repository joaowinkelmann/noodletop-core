import { ask, blue, green, info, logState, playerCount, reset } from "./log.js"
import { State, rooms } from "./state.js"
import { WebSocket } from "ws"

export function close(state: State) {
	const { roomCode, user } = state
	const room = rooms.get(roomCode)
	if (!room) return
	if (user.socket.readyState === WebSocket.OPEN) {
		state.roomCode = null
		state.status = "ROOM"
		ask(user.socket, "Room Code")
	}
	room.delete(user)
	if (room.size === 0) rooms.delete(roomCode)
	else
		room.forEach(({ socket }) =>
			socket.send(
				`${blue}${user.pseudo} ${green}left the room${
					user.socket.isAlive ? "" : " (inactivity)"
				} ${blue}>${reset}`,
			),
		)
	logState()
}

export function chooseRoom(message: string, state: State) {
	state.roomCode = message.trim().toUpperCase()
	if (state.roomCode.length < 3)
		return ask(state.user.socket, "Room Code", true)
	state.status = "NICKNAME"
	ask(state.user.socket, "your Nickname")
}

export function chooseNickname(message: string, state: State) {
	const { roomCode, user } = state
	const pseudo = message.trim()
	if (pseudo.length < 3) return ask(user.socket, "your Nickname", true)
	user.pseudo = pseudo
	if (!rooms.has(roomCode)) rooms.set(roomCode, new Set())
	const room = rooms.get(roomCode)
	room.add(user)
	room.forEach(({ socket }) => {
		if (socket !== user.socket)
			socket.send(
				`${blue}${user.pseudo}${green} joined the room ${blue}>${reset}`,
			)
		else socket.send(info(roomCode, room))
	})
	state.status = "CONNECTED"
	logState()
}

const commands = {
	"/help": {
		desc: "Command list",
		command({ user }: State) {
			user.socket.send(
				`${green}Available commands: \r\n\t${blue}${Object.entries(commands)
					.map(([k, v]) => [k, v.desc].join(` ${green}\t`))
					.join(`\r\n\t${blue}`)} \r\n${blue}>`,
			)
		},
	},
	"/info": {
		desc: "Room information",
		command({ user, parameters }: { user: any, parameters: string[] }) {
			const roomCode = parameters[0]; // Assuming the first parameter is the room code
			user.socket.send(info(roomCode, rooms.get(roomCode)))
		},
	},
	"/list": {
		desc: "Room user list",
		command({ user, parameters }: { user: any, parameters: string[] }) {
			const roomCode = parameters[0]; // Assuming the first parameter is the room code
			const room = rooms.get(roomCode)
			user.socket.send(
				`${playerCount(room.size)}: ${blue}${[...room.values()]
					.map((user) => user.pseudo)
					.join(`${green}, ${blue}`)} >`,
			)
		},
	},
	"/quit": {
		desc: "Leave the room",
		command(state: State) {
			close(state)
		},
	},
	"/echo": {
		desc: "Echo message to all users",
		command({ parameters, state }: { parameters: string[], state: State }) {
			const message = parameters.slice(1).join(" "); // Join all parameters after the first one
			const roomCode = state.roomCode;
			rooms.get(roomCode).forEach(({ socket }) => {
				socket.send(`${blue}Echo: ${reset}${message}`);
			});
		},
	},
}

export function broadcastMessage(message: string, state: State) {
	if (message.startsWith("/") && message.length > 1) {
		const [command, ...parameters] = message.slice(1).split(" "); // Split command and parameters
		for (const cmd of Object.keys(commands)) {
			if (command === cmd) {
				return commands[cmd].command({ user: state.user, parameters });
			}
		}
	}

	rooms.get(state.roomCode).forEach(({ socket }) => {
		socket.send(`${blue}${state.user.pseudo} >${reset} ${message}`);
	});
}
