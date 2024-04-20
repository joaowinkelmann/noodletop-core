import { isJSON } from './common.js';
import { Rand } from './randomizer.js';
import { State } from '../models/state.js';
import { Room } from '../models/room.js';
import { rooms, createRoom } from './stateManager.js';
import { ServerWebSocket } from 'bun';

function ask(socket: ServerWebSocket<unknown>, item: string, errorText?: string) {
    if (errorText) {
        socket.send(errorText);
    }
    socket.send(`?${item}`);
}

export function chooseRoom(message: string, state: State) {
    state.roomCode = message.trim().toLowerCase();
    if (state.roomCode.length < 3) {
        return ask(state.user.socket, 'room', 'Room should have at least 3 characters');
    }
    if (rooms.get(state.roomCode)?.isFull()) {
        return ask(state.user.socket, 'room', 'Room is full');
    }
    state.status = 'NICKNAME';
    ask(state.user.socket, 'nick');
}

export function chooseNickname(message: string, state: State) {
    const { roomCode, user } = state;
    const username = message.trim();
    if (username.length < 3) return ask(user.socket, 'nick', 'Nickname should have at least 3 characters');
    user.setUsername(username);

    if (!rooms.has(roomCode)) {
        createRoom(roomCode, state.user);
    }

    const room: Room = rooms.get(roomCode) as Room;

    if (room.addUser(user)) {
        // user joined the room successfully
        room.getUsers().forEach(({ socket }) => {
            if (socket !== user.socket) { // the other users
                socket.send(
                    `${user.username} joined the room`
                );
            } else { // the user itself (private info goes here)
                socket.send(room.getRoomInfo());
                // sending user id so that it may be saved by the client
                socket.send(`u ${user.id}`);
            }
        });
        state.status = 'CONNECTED';
    } else {
        // user could not join the room, because it was full (or some other reason in the future)
        global.log(JSON.stringify(user.socket));
        global.log(JSON.stringify(state));
        ask(user.socket, 'room', 'Room is full or your username is already taken');
    }
}

const commands = {
    '/help': {
        desc: 'Command list',
        command({ user }: State) {
            user.socket.send(
                `Available commands: \r\n\t${Object.entries(
                    commands
                )
                    .map(([k, v]) => [k, v.desc].join(` \t`))
                    .join(`\r\n\t`)} \r\n\n\tWiki: https://t.ly/daGAP`
            );
        }
    },
    '/list': {
        desc: 'Room user list',
        command({ roomCode, user }: State) {
            const room: Room = rooms.get(roomCode) as Room;
            user.socket.send(`User count: ${room.countUsers()} > (${[...room.getUsers()].map((user) => user.username).join(', ')})`);
        }
    },
    '/quit': {
        desc: 'Quit the room',
        command(state: State) {
            rooms.get(state.roomCode).disconnectUser(state.user, true, 4900, '/quit');
        }
    },
    '/leave': {
        desc: 'Leave the room temporarily',
        command(state: State) {
            state.user.userLeaveRoom(); // set away status
            rooms.get(state.roomCode).disconnectUser(state.user, false, 4100, '/leave');
        }
    },
    '/obj': {
        desc: 'Perform operations with objects. Usage: /obj [read|create|update|delete] [id] [{"property": "value"}]',
        command(state: State, operation: string) {
            const room: Room = rooms.get(state.roomCode) as Room;
            if (!room) return;

            let response = null;

            // get the operation
            const [op, ...args] = operation.split(' ');
            switch (op) {
                case 'read':
                case 'r':
                    response = room.getObj(args[0]);
                    break;
                case 'readall':
                    response = room.getAllObj();
                    break;
                case 'update':
                case 'u':
                    const id = args.shift();
                    let properties = null;

                    if (isJSON(args.join(' ')) === false) {
                        response = 'Invalid JSON properties';
                        break;
                    } else {
                        properties = JSON.parse(args.join(' '));
                    }
                    response = room.updateObj(id, properties);
                    break;
                case 'delete':
                case 'd':
                    response = room.deleteObj(args[0]);
                    break;
                case 'create':
                case 'c':
                    // Call the createObject method on the instance

                    const type = args.shift(); // get type as first argument
                    let props = null;

                    if (isJSON(args.join(' '))) {
                        props = JSON.parse(args.join(' '));
                    }

                    response = room.createObj(type, props);
                    break;
                default:
                    response = 'Invalid operation';
                    break;
            }

            room.getUsers().forEach(({ socket }) => {
                socket.send(
                    `${state.user.username} > ${response}`
                );
            });
        }
    },
    '/usr': {
        desc: 'Perform operations with your own user. Usage: /usr [setUsername|info] [newUsername]',
        command(state: State, operation: string) {
            const room: Room = rooms.get(state.roomCode) as Room;
            if (!room) return;

            let response = null;

            // get the operation
            const [op, ...args] = operation.split(' ');
            switch (op) {
                case 'setUsername':
                    response = state.user.setUsername(args[0]);
                    break;
                case 'info':
                    response = state.user.getInfo();
                    break;
                default:
                    response = 'Invalid operation';
                    break;
            }

            room.getUsers().forEach(({ socket }) => {
                socket.send(
                    `${state.user.username} > ${response}`
                );
            });
        }
    },
    '/room': {
        desc: 'Perform operations within the room. Usage: /room [set|close|info|list|kick] [username]',
        command(state: State, operation: string) {
            const room: Room = rooms.get(state.roomCode) as Room;
            if (!room) return;

            let response = null;
            const [op, ...args] = operation.split(' ');
            const argArr = args.map((arg) => arg.trim());
            switch (op) {
                case 'set':
                    response = room.setRoomData(argArr[0], argArr[1]);
                    break;
                case 'info':
                    response = room.getRoomInfo();
                    break;
                default:
                    response = 'Invalid operation';
                    break;
            }

            room.getUsers().forEach(({ socket }) => {
                socket.send(
                    `${response}`
                );
            });
        }
    },
    '/roll': {
        desc: 'Roll dice. Usage: /roll [dice notation (2d6+3)] [show rolls (true|false)]',
        command(state: State, operation: string) {
            const diceNotation = operation.split(' ')[0];
            const showRolls = operation.split(' ')[1] === 'false' ? false : true;

            const result = Rand.roll(diceNotation, showRolls);
            // send the result to the user
            state.user.socket.send(
                `${state.user.username} > ${result}`
            );
        }
    },
    '/team': {
        desc: 'Perform operations with teams. Usage: /team [create|join|leave|list] [teamName]',
        command(state: State, operation: string) {
            const room: Room = rooms.get(state.roomCode) as Room;
            if (!room) return;

            let response = null;
            const [op, ...args] = operation.split(' ');
            const argArr = args.map((arg) => arg.trim());
            switch (op) {
                case 'create':
                case 'add':
                    response = room.createTeam(argArr[0]);
                    break;
                case 'join':
                    response = room.joinTeam(argArr[0], state.user);
                    break;
                case 'leave':
                    response = room.leaveTeam(state.user);
                    break;
                case 'delete':
                    response = room.deleteTeam(argArr[0]);
                    break;
                case 'list':
                    response = room.listTeams();
                    break;
                case 'get':
                    response = room.getTeam(argArr[0]);
                    break;
                default:
                    response = 'Invalid operation';
                    break;
            }
            state.user.socket.send(`${response}`);
        }
    },
    '/debug': {
        desc: 'Developer debug command',
        command(state: State, operation: string) {
            const [op, ...args] = operation.split(' ');
            switch (op) {
                case 'dateFromId':
                    const idString = args[0];
                    state.user.socket.send(String(Rand.dateFromId(idString)));
                    break;
                default:
                    state.user.socket.send(`Invalid operation`);
                    break;
            }
        }
    }
};

export function broadcastMessage(message: string, state: State) {
    const room: Room = rooms.get(state.roomCode) as Room;
    room.heartbeat(state.user);

    if (message.length === 0) return;

    if (message.startsWith('/') && message.length > 1) {
        const command = message.split(' ')[0];
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
            socket.send(`m ${state.user.username}: ${message}`);
        });
}