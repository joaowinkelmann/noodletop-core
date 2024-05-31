import { Room } from '~/models/room';
import { StateManager } from '~/utils/stateManager';
import { State } from '~/models/state';
import { isAdmin } from '~/utils/common';

export async function roomCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');
    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    if (!room) return;

    let response = null;

    const argArr = args.map((arg) => arg.trim());
    switch (op) {
        case 'set':
            response = room.setRoomData(argArr[0], argArr[1]);
            break;
        case 'info':
            response = room.getRoomInfo();
            break;
        case 'create':
        case 'add':
            response = room.createTeam(argArr[0]);
            break;
        case 'join':
            response = room.joinTeam(argArr[0], state.user);
            break;
        case 'leave':
            response = room.leaveTeam(state.user);
            break;
        case 'delete':
            if (!isAdmin(state.user)) return;
            response = room.deleteTeam(argArr[0], state.user);
            break;
        case 'list':
            response = room.listTeams();
            break;
        case 'get':
            response = room.getTeam(argArr[0]);
            break;
        case 'save':
            response = await room.save();
            console.log(response);
            break;
        case 'setpassword':
            response = room.setPassword(argArr[0]);
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    // await for the response if it is a promise
    if (response instanceof Promise) {
        response = await response;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}