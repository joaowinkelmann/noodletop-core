import { roomCommands } from './roomCommands';
import { userCommands } from './userCommands';
import { connectionCommands } from './connectionCommands';
import { messageCommands } from './messageCommands';
// import other command handlers as needed...

export interface commandHandler {
    [key: string]: (state: any, message: string) => void;
}

/**
 * Handles commands sent in by the user.
 * @parms {object} state - The current state of the user.
 * @parms {string} message - The raw given input.
 */
export const commandHandlers: commandHandler = {
    '/room': roomCommands,
    // '/usr': userCommands,
    '/user': userCommands,
    '/connect': connectionCommands,
    '/message': messageCommands,
    // map other command handlers here...
};