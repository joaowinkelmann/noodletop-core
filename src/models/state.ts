import { User } from './user';

export type State = {
    // 1st State: ACK  -> User must perform a handshake by sending back the received userId, confirming its integrity
    // 2nd State: ROOM -> User must enter a room code
    // 3rd State: NAME -> User must enter a username
    // 4th State: OK   -> User is connected.
    status: 'ACK' |'ROOM' | 'NAME' | 'OK';
    roomCode: string;
    user: User;
};