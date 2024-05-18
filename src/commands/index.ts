import { roomCommands } from './roomCommands';
import { userCommands } from './userCommands';
import { connectionCommands } from './connectionCommands';
import { messageCommands } from './messageCommands';
import { ingressCommands } from './ingressCommands';
import { objectCommands } from './objectCommands';
import { teamCommands } from './teamCommands';
import { debugCommands } from './debugCommands';
import { helpCommands } from './helpCommands';
import { auxCommands } from './auxCommands';

export interface CommandHandler {
    [key: string]: (state: any, message: string) => void;
}

/**
 * Handles commands sent in by the user.
 * @parms {object} state - The current state of the user.
 * @parms {string} message - The raw given input.
 */
export const commandHandlers: CommandHandler = {
    '/room': roomCommands,
    '/user': userCommands,
    '/obj': objectCommands,
    '/team': teamCommands,
    '/ingress': ingressCommands,
    '/message': messageCommands,
    '/quit': connectionCommands,
    '/leave': connectionCommands,
    '/debug': debugCommands,
    '/help': helpCommands,
    '/roll': auxCommands,
    '/listroom': auxCommands,
    '/listrooms': auxCommands,
    // map other command handlers here...
};