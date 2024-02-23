import { ask, blue, green, info, logState, playerCount, reset } from "./log.js"
import { State, rooms } from "./state.js"
import { WebSocket } from "ws"

import { RoomObject, RoomObjects } from "./object.js"

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
		command({ roomCode, user }: State) {
			user.socket.send(info(roomCode, rooms.get(roomCode)))
		},
	},
	"/list": {
		desc: "Room user list",
		command({ roomCode, user }: State) {
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
	"/globalecho": {
		desc: "Send a message to all connected sockets",
		command(state: State, message: string) {
			rooms.forEach((room) => {
				room.forEach(({ socket }) => {
					socket.send(`${blue}${state.user.pseudo} >${reset} ${message}`)
				})
			})
		},
	},
	"/obj": {
		desc: "Perform operations on RoomObject",
		command(state: State, operation: string) {
			const room = rooms.get(state.roomCode);
			if (!room) return;

			// Create an instance of the RoomObjects class
			const roomObjects = new RoomObjects();

			// get the operation
			const [op, ...args] = operation.split(" ");
			switch (op) {
				case "create":
				default:
					// Call the createObject method on the instance
					roomObjects.createObject(state, {});
			}
		},
	},
}

export function broadcastMessage(message: string, state: State) {
	if (message.startsWith("/") && message.length > 1) {
		const command = message.split(" ")[0]
		const commandArgs = message.slice(command.length + 1)
		if (commands.hasOwnProperty(command)) {
			commands[command].command(state, commandArgs)
			return
		}
	}

	rooms.get(state.roomCode).forEach(({ socket }) => {
		socket.send(`${blue}${state.user.pseudo} >${reset} ${message}`)
	})
}