// // Class to manage the state of the user, room, and socket connections
// import { User } from '../models/user';
// import { Room } from '../models/room';
// import { State } from '../models/state';
// import { Sweeper } from './sweeper';
// import { ServerWebSocket } from 'bun';
// // import { RoomDataManager } from '~/services/roomDataManager';

// /**
//  * Map that associates a ServerWebSocket with its corresponding State.
//  */
// const stateMap = new Map<ServerWebSocket<unknown>, State>();

// /**
//  * Creates a new state with and puts it in the stateMap. Sends the user ID to the client, and prompts the client for a room code, putting the state into the 'ROOM' status.
//  * @param socket - The server WebSocket.
//  * @param username - The username (optional).
//  * @returns The new state object.
//  */
// export function createState(socket: ServerWebSocket<unknown>): State {
//     const state: State = {
//         status: 'ROOM',
//         roomCode: null,
//         user: new User(socket)
//     };

//     stateMap.set(socket, state);

//     socket.send(`u ${state.user.getId()}`);
//     socket.send('?room');
//     return state;
// }

// /**
//  * Gets a state from the stateMap, sending a heartbeat to the user and the room.
//  * @param socket
//  */
// export function getState(socket: ServerWebSocket<unknown>): State | undefined {
//     const state: State = stateMap.get(socket) ?? undefined;
//     if (state && state.roomCode) {
//         const room: Room = rooms.get(state.roomCode) as Room;
//         room.heartbeat(state.user);
//     }
//     return state;
// }

// /**
//  * Retrieves the state of a user in a room. Used to reconnect/authenticate a user back into a room.
//  * @param socket - The newly assigned WebSocket connection.
//  * @param userId - The ID of the user.
//  * @param roomCode - The code of the room.
//  * @returns The state of the user in the room, or null if the room or user was not found.
//  */
// export const restoreState = (socket: ServerWebSocket<unknown>, userId: string, roomCode: string): State | null => {
//     const room: Room = rooms.get(roomCode) as Room;
//     if (!room) {
//         return null;
//     }
//     const user = room.getUserById(userId);

//     if (!user) {
//         global.log(`User ${userId} not found in room ${roomCode}`);
//         return null;
//     }

//     // disconnect the old socket
//     if (user.getSocket().readyState === WebSocket.OPEN) {
//         user.getSocket().close(4007, 'User reconnected');
//     }

//     user.setSocket(socket);
//     return {
//         status: 'OK',
//         roomCode,
//         user
//     };
// };

// /**
//  * Removes a State from the stateMap.
//  * @param socket
//  * @returns
//  */
// export function deleteState(socket: ServerWebSocket<unknown>): boolean {
//   return stateMap.delete(socket);
// }

// /**
//  * Keeps the WebSocket connection alive by sending periodic ping messages.
//  * @param socket - The WebSocket connection.
//  * @param interval - The interval (in seconds) between each ping message. Default is 30 seconds.
//  */
// export const keepAlive = (socket: ServerWebSocket<unknown>, interval: number = 30) => {
//     const intervalId = setInterval(() => {
//         if (socket.readyState === WebSocket.OPEN) {
//             socket.ping();
//         } else {
//             clearInterval(intervalId);
//         }
//     }, interval * 1000);
// };

// export const createRoom = (roomCode: string, creator: User): Room => {
//     const room = new Room(roomCode);
//     rooms.set(roomCode, room);

//     // Promote the user(creator) to admin, as they're the first to enter the room
//     room.promoteToAdmin(creator);

//     return room;
// };


// class ObservableMap<Room> extends Map {
//     constructor(private callback: () => void) {
//         super();
//     }

//     set(key, value) {
//         const result = super.set(key, value);
//         this.callback();
//         return result;
//     }

//     delete(key) {
//         const result = super.delete(key);
//         this.callback();
//         return result;
//     }
// }

// export function roomExportApi(roomCode) {
//     // JSONify a room and return it
//     const room = rooms.get(roomCode) as Room;
//     global.log(room.getCode());
//     // global.log(rooms);
//     if (room) {
//         // return RoomDataManager.convertRoomToData(room);
//         return JSON.stringify(room);
//     }
//     else {
//         return { error: 'Room not found' };
//     }
// }

// export const rooms = new ObservableMap<Room>(() => {
//     Sweeper.sweepInactiveUsers(rooms);
//     // Sweeper.sweepInactiveRooms(rooms);
// });

import { User } from '../models/user';
import { Room } from '../models/room';
import { State } from '../models/state';
import { Sweeper } from './sweeper';
import { ServerWebSocket } from 'bun';

class ObservableMap<K, V> extends Map<K, V> {
    constructor(private callback: () => void) {
        super();
    }

    set(key: K, value: V) {
        const result = super.set(key, value);
        this.callback();
        return result;
    }

    delete(key: K) {
        const result = super.delete(key);
        this.callback();
        return result;
    }
}

export class StateManager {
    private stateMap: Map<ServerWebSocket<unknown>, State>;

    // rooms
    public static rooms: Map<string, Room> = new Map();
    public static stateMap = new ObservableMap<ServerWebSocket<unknown>, State>(() => {});

    // dependency debugging: log how many times the constructor is called
    private static instanceCount = 0;

    constructor() {
        StateManager.instanceCount++;
        // this.stateMap = new ObservableMap<ServerWebSocket<unknown>, State>(this.sweepInactiveUsers);
    }

    private sweepInactiveUsers() {
        Sweeper.sweepInactiveUsers(StateManager.rooms);
    }

    public static createState(socket: ServerWebSocket<unknown>): State {
        const state: State = {
            status: 'ROOM',
            roomCode: null,
            user: new User(socket)
        };

        this.stateMap.set(socket, state);

        socket.send(`u ${state.user.getId()}`);
        socket.send('?room');
        return state;
    }

    public static getState(socket: ServerWebSocket<unknown>): State | undefined {
        const state: State = this.stateMap.get(socket) ?? undefined;
        if (state && state.roomCode) {
            const room: Room = StateManager.rooms.get(state.roomCode) as Room;
            room.heartbeat(state.user);
        }
        return state;
    }

    public static restoreState(socket: ServerWebSocket<unknown>, userId: string, roomCode: string): State | null {
        const room: Room = StateManager.rooms.get(roomCode) as Room;
        if (!room) {
            return null;
        }
        const user = room.getUserById(userId);

        if (!user) {
            global.log(`User ${userId} not found in room ${roomCode}`);
            return null;
        }

        // disconnect the old socket
        if (user.getSocket().readyState === WebSocket.OPEN) {
            user.getSocket().close(4007, 'User reconnected');
        }

        user.setSocket(socket);
        return {
            status: 'OK',
            roomCode,
            user
        };
    }

    public static deleteState(socket: ServerWebSocket<unknown>): boolean {
        return StateManager.stateMap.delete(socket);
    }

    public static keepAlive(socket: ServerWebSocket<unknown>, interval: number = 30) {
        const intervalId = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.ping();
            } else {
                clearInterval(intervalId);
            }
        }, interval * 1000);
    }

    public static createRoom(roomCode: string, creator: User): Room {
        const room = new Room(roomCode);
        StateManager.rooms.set(roomCode, room);

        // Promote the user(creator) to admin, as they're the first to enter the room
        room.promoteToAdmin(creator);

        return room;
    }

    // queries and returns the rooms map into a JSON object
    public static getRooms() {
        // console.log("Instance count:" + this.instanceCount);
        const rooms = Array.from(StateManager.rooms.values());
        console.log("Room count:" + rooms.length);
        return rooms.map((room) => JSON.stringify(room));
    }

    // same as getRooms but for a single room
    public static getRoom(roomCode: string) {
        const room = StateManager.rooms.get(roomCode);
        if (!room) {
            return "Room not found";
        }
        return JSON.stringify(room);
    }
}