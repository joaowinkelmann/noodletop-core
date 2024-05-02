import { User } from './user';

export type State = {
    // 1st: ROOM -> User must enter a room code >> 2nd: NAME -> User must enter a username >> 3rd: OK -> User is connected.
    status: 'ROOM' | 'NAME' | 'OK';
    roomCode: string;
    user: User;
};