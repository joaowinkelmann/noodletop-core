import { User } from './user';

export type State = {
    // 1st: ACK -> User must send back the id it has received -> 2nd: ROOM -> User must enter a room code
    // 3rd: NAME -> User must enter a username >> 4th: OK -> User is connected.
    status: 'ACK' |'ROOM' | 'NAME' | 'OK';
    roomCode: string;
    user: User;
};