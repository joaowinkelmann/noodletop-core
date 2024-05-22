import { User } from '../models/user';
import { Room } from '../models/room';
import { State } from '../models/state';
import { Sweeper } from './sweeper';
// import { ObservableMap } from './observableMap';
import { ServerWebSocket } from 'bun';

// Class to manage the state of the user, room, and socket connections
export class StateManager {

    public static rooms: Map<string, Room> = new Map();
    public static stateMap: Map<ServerWebSocket<unknown>, State> = new Map();

    public static createState(socket: ServerWebSocket<unknown>): State {
        const state: State = {
            status: 'ACK',
            roomCode: null,
            user: new User(socket)
        };

        this.stateMap.set(socket, state);

        socket.send(`u ${state.user.getId()}`);
        socket.send('?ack');
        return state;
    }

    public static getState(socket: ServerWebSocket<unknown>): State | undefined {
        const state: State = this.stateMap.get(socket) ?? undefined;
        if (state && state.roomCode) {
            const room: Room = StateManager.getRoom(state.roomCode) as Room;
            room.heartbeat(state.user);
        }
        return state;
    }

    public static restoreState(socket: ServerWebSocket<unknown>, userId: string, roomCode: string): State | null {
        const room: Room = StateManager.getRoom(roomCode) as Room;
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

    // check if a state received from the client is valid
    public static isValidState(userId: string, roomCode: string): boolean {
        const room = StateManager.getRoom(roomCode);
        if (!room) {
            return false;
        }
        const user = room.getUserById(userId);
        if (!user) {
            return false;
        }
        return true;
    }

    /**
     * Keeps the WebSocket connection alive by sending periodic ping messages.
     * If the WebSocket connection is closed, the interval is cleared.
     * @param socket - The WebSocket connection.
     * @param interval - The interval in seconds between each ping message. Default is 30 seconds.
     */
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

        // initialize the sweeper if it's the first room
        if (StateManager.rooms.size === 1) {
            Sweeper.sweepInactiveUsers();
        }
        
        return room;
    }

    // queries and returns the rooms map into a JSON object
    public static getRooms(): Map<string, Room>{
        // const rooms = Array.from(StateManager.rooms.values());
        // return rooms.map((room) => JSON.stringify(room));

        return StateManager.rooms;
    }

    // same as getRooms but for a single room
    public static getRoom(roomCode: string): Room | undefined {
        const room = StateManager.rooms.get(roomCode);
        // if (!room) {
        //     return "Room not found";
        // }
        // return room.getRoomInfo();
        if (!room) {
            // throw new Error('Room not found');
            return undefined;
        }
        return room;
    }
}