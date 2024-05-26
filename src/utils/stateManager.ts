import { User } from '../models/user';
import { Connection } from '~/models/dto/userDTO';
import { Room } from '../models/room';
import { State } from '../models/state';
import { RoomSweeper } from './sweeper';
// import { ObservableMap } from './observableMap';
import { ServerWebSocket } from 'bun';
import { WebSocketData } from './common';
import { Rand } from './randomizer';

// Class to manage the state of the user, room, and socket connections
export class StateManager {
    private static instance: StateManager;
    private static instanceId: string = Rand.id(1);

    // array of suspicious ip addresses
    // private static ipBlocklist: string[] = [];
    // map of suspicious ip addresses and the date they were added
    private static ipBlocklist: Map<string, Date> = new Map();

    public rooms: Map<string, Room> = new Map();
    public stateMap: Map<ServerWebSocket<unknown>, State> = new Map();

    private constructor() {
        // testing: adding localhost as a blocked ip
        // StateManager.ipBlocklist.set("::ffff:127.0.0.1", new Date());
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
            global.log(`Created new StateManager: ${StateManager.instanceId}`);
        }
        return StateManager.instance;
    }

    private createState(socket: ServerWebSocket<unknown>): State {
        const state: State = {
            status: 'ACK',
            roomCode: null,
            user: new User(socket)
        };

        this.stateMap.set(socket, state);

        StateManager.keepAlive(state);

        socket.send(`u ${state.user.getId()}`);
        socket.send('?ack');
        return state;
    }

    public getState(socket: ServerWebSocket<unknown>): State | undefined {
        const state: State = this.stateMap.get(socket) ?? undefined;
        if (state && state.roomCode) {
            const room: Room = this.getRoom(state.roomCode) as Room;
            room.heartbeat(state.user);
        }
        return state;
    }

    /**
     * Initializes the state for the given socket. Either by restoring it, or creating a new one.
     * 
     * @param socket - The server WebSocket instance.
     */
    public initState(socket: ServerWebSocket<WebSocketData>): void {
        // check the received ip from WebSocketData
        // const ip = socket.data.ip;
        // if (!ip) {
        //     global.log("IP not found");
        // }

        global.log(`Blocked IPs: ${JSON.stringify(StateManager.ipBlocklist.values())}`)
        global.log(`IP: ${socket.data.ip}`);

        // if (StateManager.ipBlocklist.includes(socket.data.ip)) {
        if (StateManager.ipBlocklist.has(socket.data.ip)) {
            global.log(`Blocked IP: ${socket.data.ip}`);
            socket.close(4003, 'Blocked IP');
            return;
        }

        if (!this.restoreState(socket, socket.data.userId, socket.data.roomCode)) {
            this.createState(socket);
        }
    }

    private restoreState(newSocket: ServerWebSocket<unknown>, userId: string, roomCode: string): State | false {
        const room: Room = this.getRoom(roomCode) as Room;
        if (!room) {
            return false;
        }
        const user = room.getUserById(userId);

        if (!user) {
            global.log(`User ${userId} not found in room ${roomCode}`);
            return false;
        }

        // reassign the socket
        if (user.getSocket().readyState === WebSocket.OPEN) {
            user.getSocket().close(4007, 'User reconnected');
        }
        user.setSocket(newSocket);

        const state: State = {
            status: 'OK',
            roomCode,
            user
        };

        StateManager.keepAlive(state);

        return state;
    }

    public deleteState(socket: ServerWebSocket<unknown>): boolean {
        return this.stateMap.delete(socket);
    }

    // check if a state received from the client is valid
    public isValidState(userId: string, roomCode: string): boolean {
        const room = this.getRoom(roomCode);
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
     *
     * @param state - The state object containing the user and the socket.
     * @param interval - The interval in seconds between each ping message. Default is 30 seconds.
     */
    public static keepAlive(state: State, interval: number = 30) {
        const intervalId = setInterval(() => {
            if (state.user.getSocket().readyState === WebSocket.OPEN) {
                state.user.getSocket().ping();
            } else {
                // websocket was closed
                if (state.user.getConnectionStatus() === Connection.Active) {
                    state.user.setConnectionStatus(Connection.Away);
                }
                clearInterval(intervalId);
            }
        }, interval * 1000);
    }

    public createRoom(roomCode: string, creator: User): Room {
        const room = new Room(roomCode);
        this.rooms.set(roomCode, room);

        // Promote the user(creator) to admin, as they're the first to enter the room
        room.promoteToAdmin(creator);

        RoomSweeper.startSweeping(parseInt(process.env.SWEEP_THRESHOLD_MINS), parseInt(process.env.SWEEP_INTERVAL_MINS));

        return room;
    }

    // queries and returns the rooms map into a JSON object
    public getRooms(): Map<string, Room>{
        // const rooms = Array.from(StateManager.rooms.values());
        // return rooms.map((room) => JSON.stringify(room));

        return this.rooms;
    }

    // same as getRooms but for a single room
    public getRoom(roomCode: string): Room | undefined {
        const room = this.rooms.get(roomCode);
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

    public authUser(roomCode: string, userId: string, password: string): boolean {
        const room = this.getRoom(roomCode) as Room;
        if (!room) {
            return false;
        }
        return room.checkPassword(userId, password);
    }
}