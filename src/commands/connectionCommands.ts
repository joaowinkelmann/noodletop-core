import { State } from '~/models/state';
import { rooms, createRoom } from '~/utils/stateManager';
import { Room } from '~/models/room';
import { User } from '~/models/user';

export function connectionCommands(state: State, operation: string) {
    let response = null;

    if (state.status === 'ROOM') {
        // user is answering a prompt to enter a room, so let's understand the sent message as the roomCode
        const roomCode = operation.trim();

        if (!rooms.has(roomCode)) {
            // room does not exist, so let's create it
            createRoom(roomCode, state.user);
        } else {
            let room: Room = rooms.get(roomCode);
            if (!room.isAvaliable()) {
                global.l("User wasn't able to join");
                state.user.getSocket().send("Room isn't avaliable");
                // @todo - inform the user that the room is not avaliable/handle an error
                return; // if the room is not avaliable, ignore the request
            }
        }

        state.roomCode = roomCode;
        state.status = 'NAME'; // user is now being asked to enter a username,

        response = '?name'; // ask the user to enter a username
    } else if (state.status === 'NAME') {
        // user is answering a prompt to enter a username, so let's understand the sent message as the username
        const username = operation.trim();

        state.user.setUsername(username);

        const room: Room = rooms.get(state.roomCode);
        const user: User = state.user;

        // try to add the user into the room
        if (room.addUser(user)) {
            // user joined the room successfully
            room.getUsers().forEach(({ socket }) => {
                if (socket !== user.socket) { // the other users
                    socket.send(
                        `${user.username} joined the room`
                    );
                }
            });
            user.getSocket().send(room.getRoomInfo());
            state.status = 'OK'; // user is all set
        } else {
            // user could not join the room, because it was full (or some other reason in the future). For now, we only handle duplicate usernames
            global.l(JSON.stringify(state));
            // ask(user.socket, 'nick', 'Username is already taken');


            // inform the user that his name is already taken, prompt him to enter a new one
            response = '?name'; // ask the user to enter a username
            // @todo - Turn index.ts (commandHandlers) into a class, so that we may treat cases in which the response should be presented as an error, and put it into a JSON object for example:
            // {err: "Username is already taken. Please enter a new one." response: "?name"} or something like that.
        }
    } else {
        return; // state.status has to be "OK" already for some reason, so just ignore the request
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}