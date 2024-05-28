import { State } from '~/models/state';
import { StateManager } from '~/utils/stateManager';
import { Room } from '~/models/room';
import { User } from '~/models/user';
import { commandHandlers } from '.';

/**
 * Manages a newly formed incoming connection, with the objetive of getting a state into the "OK" status.
 * @param state
 * @param message
 * @returns
 */
export function ingressCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    let response = null;
    switch (state.status) {
        case 'ACK':
            // user is answering a prompt to enter an ACK, so let's understand the sent message as the user id
            const id = message.trim();

            if (id !== state.user.getId()) {
                // @todo - Handle as error in the future.
                // @todo - check for profanity, perhaps
                state.user.getSocket().send('{err: "Invalid ACK, try again"}');
                state.user.getSocket().send(`u ${state.user.getId()}`);
                return; // ignore the request
            } else {
                state.status = 'ROOM'; // user is now being asked to enter a room code
                response = '?room'; // ask the user to enter a room code
            }
            break;

        case 'ROOM':
            // user is answering a prompt to enter a room, so let's understand the sent message as the roomCode
            const roomCode = message.trim().toLowerCase();

            // roomCode validation
            if (roomCode.length < 3) {
                // @todo - Handle as error in the future.
                // @todo - check for profanity, perhaps, if the room code can be defined by the user
                state.user.getSocket().send('Room code must be at least 3 characters long');
                state.user.getSocket().send('?room');
                return; // ignore the request
            }

            if (!StateManager.getInstance().getRooms().has(roomCode)) {
                // room does not exist, so let's create it
                StateManager.getInstance().createRoom(roomCode, state.user);
            } else {
                const room: Room = StateManager.getInstance().getRoom(roomCode) as Room;
                if (!room.isAvaliable()) {
                    global.log('User wasn\'t able to join');
                    state.user.getSocket().send('Room isn\'t avaliable');
                    // @todo - inform the user that the room is not avaliable/handle an error
                    return; // if the room is not avaliable, ignore the request
                }
                // check for room password
                // room.authenticate(state.user);
                if (room.isPasswordProtected()) {
                    state.status = 'RPWD'; // user is being asked to enter a password
                    state.roomCode = roomCode;
                    state.user.getSocket().send('?pass'); // ask the user to enter a password
                    return;
                }
            }

            state.roomCode = roomCode;
            state.status = 'NAME'; // user is now being asked to enter a username

            response = '?name'; // ask the user to enter a username
            break;
        case "RPWD": // Room Password

            // const room: Room = StateManager.getInstance().getRoom(roomCode) as Room;

            // if (room.authenticate(state.user, message.trim())) {
            //     state.status = 'NAME'; // user is now being asked to enter a username
            //     response = '?name'; // ask the user to enter a username
            // } else {
            //     state.user.getSocket().send('Invalid password');
            //     state.user.getSocket().send('?pass');
            // }
            if (StateManager.getInstance().authUser(state.roomCode, state, message.trim())) {
                state.status = 'NAME'; // user is now being asked to enter a username
                response = '?name'; // ask the user to enter a username
            } else {
                state.user.getSocket().send('{err: "Invalid password"}');
                state.user.getSocket().send('?pass');
            }


            break;


        case 'NAME':
            // user is answering a prompt to enter a username, so let's understand the sent message as the username
            const username = message.trim();

            // username validation
            if (username.length < 5) {
                // @todo - Handle as error in the future.
                // @todo - check for profanity, perhaps
                state.user.getSocket().send('Username must be at least 5 characters long');
                state.user.getSocket().send('?name');
                return; // ignore the request
            }

            state.user.setUsername(username);

            const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
            const user: User = state.user;

            // try to add the user into the room
            if (room.addUser(user)) {
                // user joined the room successfully
                state.status = 'OK'; // user is all set
                room.announce(`${user.username} joined the room`);

                user.getSocket().send(room.getRoomInfo());
            } else {
                // user could not join the room, because it was full (or some other reason in the future). For now, we only handle duplicate usernames
                global.log(JSON.stringify(state));

                // inform the user that his name is already taken, prompt him to enter a new one
                state.user.getSocket().send('Username is already taken.');

                response = '?name'; // ask the user to enter a username
                // @todo - Turn index.ts (commandHandlers) into a class, so that we may treat cases in which the response should be presented as an error, and put it into a JSON object for example:
                // {err: "Username is already taken. Please enter a new one." response: "?name"} or something like that.
            }
            break;
        
        case 'OK':
            const handler = commandHandlers['/message'];
            handler(state, message);
        default:
            // state.status = 'ACK'; // user is being asked to enter an ACK
            state.user.getSocket().close(4003, 'Invalid state');
            return;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}