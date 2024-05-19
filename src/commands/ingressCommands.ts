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

    if (state.status === 'ROOM') {
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

        if (!StateManager.rooms.has(roomCode)) {
            // room does not exist, so let's create it
            StateManager.createRoom(roomCode, state.user);
        } else {
            const room: Room = StateManager.getRoom(roomCode) as Room;
            if (!room.isAvaliable()) {
                global.log('User wasn\'t able to join');
                state.user.getSocket().send('Room isn\'t avaliable');
                // @todo - inform the user that the room is not avaliable/handle an error
                return; // if the room is not avaliable, ignore the request
            }
        }

        state.roomCode = roomCode;
        state.status = 'NAME'; // user is now being asked to enter a username

        response = '?name'; // ask the user to enter a username
    } else if (state.status === 'NAME') {
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

        const room: Room = StateManager.getRoom(state.roomCode) as Room;
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
    } else {
        // return; // state.status has to be "OK" already for some reason, so just ignore the request
        const handler = commandHandlers['/message'];
        handler(state, message);
        return;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}