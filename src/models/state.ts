// src/models/State.ts
import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../utils/common';
import { User } from './user';
import { Rand } from '../utils/randomizer';

// export type State = {
//     // 1st State: ACK  -> User must perform a handshake by sending back the received userId, confirming its integrity
//     // 2nd State: ROOM -> User must enter a room code
//     //  Optional: RPWD -> User must enter a room password
//     // 3rd State: NAME -> User must enter a username
//     // 4th State: OK   -> User is connected.
//     status: 'ACK' |'ROOM' | 'RPWD' | 'NAME' | 'OK';
//     roomCode: string;
//     user: User;
// };

export class State {
    status: 'ACK' | 'ROOM' | 'RPWD' | 'NAME' | 'OK';
    roomCode: string;
    user: User;

    constructor(socket: ServerWebSocket<WebSocketData>) {
        this.status = 'ACK';
        this.roomCode = '';
        this.user = new User(socket, Rand.id(2));
    }

    static createState(socket: ServerWebSocket<WebSocketData>): State {
        const state = new State(socket);
        // ... other initialization logic
        return state;
    }
}