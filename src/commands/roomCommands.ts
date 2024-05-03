import { Room } from '~/models/room';
import { rooms } from '~/utils/stateManager';
import { State } from '~/models/state';
import { isAdmin } from '~/utils/common';

export function roomCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');
    const room: Room = rooms.get(state.roomCode) as Room;
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
        default:
            response = 'Invalid operation';
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}