import { Room } from '~/models/room';
import { StateManager } from '~/utils/stateManager';
import { State } from '~/models/state';
import { isAdmin } from '~/utils/common';

export const listeners = [
    '/team'
];

export const helpString = '/team - Perform operations with teams. Usage: /team [create|join|leave|list] [teamName]';

export default function team(state: State, input: string) {
    const [command , op, ...args] = input.split(' ');

    const room: Room = StateManager.getInstance().getRoom(state.roomCode) as Room;
    if (!room) return;

    let response = null;

    switch (op) {
        case 'create':
        case 'add':
            response = room.createTeam(args[0]);
            break;
        case 'join':
            response = room.joinTeam(args[0], state.user);
            break;
        case 'leave':
            response = room.leaveTeam(state.user);
            break;
        case 'delete':
            if (!isAdmin(state.user)) return;
            response = room.deleteTeam(args[0], state.user);
            break;
        case 'list':
            response = room.listTeams();
            break;
        case 'get':
            response = room.getTeam(args[0]);
            break;
        default:
            response = 'Invalid operation';
            break;
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}