import { User } from '../models/user';
import { Connection } from '../models/dto/userDTO';
import { Room } from '../models/room';
import { State } from '../models/state';
import { RoomSweeper } from './sweeper';
import { ServerWebSocket } from 'bun';
import { WebSocketData } from './common';
import { Rand } from './randomizer';
import { IPBlocklistManager } from './IPBlocklistManager';

// Class to manage the state of the user, room, and socket connections
export class StateManager {
    private static instance: StateManager;
    private static instanceId: string = Rand.id(1);

    public rooms: Map<string, Room> = new Map();
    public stateMap: Map<ServerWebSocket<WebSocketData>, State> = new Map();

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
            global.log(`Created new StateManager: ${StateManager.instanceId}`);
        }
        return StateManager.instance;
    }

    private createState(socket: ServerWebSocket<WebSocketData>): void {
        const state = State.createState(socket);
        this.stateMap.set(socket, state);
        StateManager.keepAlive(state);
        socket.send(`u ${state.user.getId()}`);
        socket.send('?ack');
    }

    // public getState(socket: ServerWebSocket<WebSocketData>): State | undefined {
    public getState(socket: ServerWebSocket<WebSocketData>): State | undefined {
        const state: State | undefined = this.stateMap.get(socket) ?? undefined;
        if (state && state.roomCode) {
            const room: Room = this.getRoom(state.roomCode) as Room;
            room.heartbeat(state.user);
        }
        return state;
    }

    /**
     * Initializes the state for the given socket. Either by restoring it, or creating a new one.
     * This method should always create or restore a state for the given socket, unless the IP is blocked or invalid.
     *
     * @param socket - The server WebSocket instance.
     */
    public initState(socket: ServerWebSocket<WebSocketData>): void {
        IPBlocklistManager.checkIP(socket);

        if (!this.restoreState(socket, socket.data.userId, socket.data.roomCode)) {
            this.createState(socket);
        }
    }

    private restoreState(newSocket: ServerWebSocket<WebSocketData>, userId: string | null, roomCode: string | null): State | false {
        const room: Room | null = this.getRoom(roomCode);
        if (!userId || !roomCode || !room) {
            return false;
        }
        const user = room.getUserById(userId);

        if (!user) {
            // global.log(`User ${userId} not found in room ${roomCode}`);
            return false;
        }

        // reassign the socket
        if (user.getSocket().readyState === WebSocket.OPEN) {
            this.stateMap.delete(user.getSocket());
            user.getSocket().close(4007, 'User reconnected');
        }
        user.setSocket(newSocket);

        const state: State = {
            status: 'OK',
            roomCode,
            user
        };

        this.stateMap.set(newSocket, state);
        StateManager.keepAlive(state);

        return state;
    }

    public deleteState(socket: ServerWebSocket<WebSocketData>): boolean {
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
        RoomSweeper.startSweeping();

        return room;
    }

    public getRooms(): Map<string, Room>{
        return this.rooms;
    }

    public getPublicRooms(): Map<string, Room> {
        const publicRooms = new Map<string, Room>();
        this.rooms.forEach((room) => {
            if (room.isPublic()) {
                publicRooms.set(room.getCode(), room);
            }
        });
        return publicRooms;
    }

    // same as getRooms but for a single room
    public getRoom(roomCode: string | null): Room | null {
        if (!roomCode) {
            return null;
        }
        const room = this.rooms.get(roomCode);
        if (!room) {
            // throw new Error('Room not found');
            return null;
        }
        return room;
    }

    public isRoomCodeAvaliable(roomCode: string): boolean {
        return !this.rooms.has(roomCode);
    }

    public getAvaliableRoomCode(): string {
        const roomCode = Rand.getName(3, '-', false);
        while (!this.isRoomCodeAvaliable(roomCode)) {
            this.getAvaliableRoomCode();
        }
        return roomCode;
    }

    public authUser(roomCode: string, state: State, password: string): boolean {
        const room = this.getRoom(roomCode);
        if (!room || !room.checkPassword(password)) {
            IPBlocklistManager.addStrike(state);
            return false;
        } else {
            IPBlocklistManager.unblockIP(state);
            return true;
        }
    }
}