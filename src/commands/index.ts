import { shCss } from '../utils/common';
import fs from 'fs';
import path from 'path';
import { State } from '../models/state';

export interface CommandHandler {
    [command: string]: (state: State, message: string) => void;
}

/**
 * Loads the command handlers from the commands directory.
 * @returns A promise that resolves to an object containing the loaded command handlers.
 */
export async function loadCommands(): Promise<CommandHandler> {
    const commandHandlers: CommandHandler = {};
    const commandsDir = path.join(__dirname, './');
    const files = fs.readdirSync(commandsDir);

    global.log(`→ Started loading command handlers...`);
    for (const file of files) {
        if (file !== 'index.ts') {
            const module = await import(`./${file}`);
            const { listeners, default: mainHandler } = module;
            if (listeners && mainHandler) {
                for (const listener of listeners) {
                    // listener -> '/message' = handler -> 'function message()'
                    commandHandlers[listener] = mainHandler;
                }
                global.log(`\tLoaded ${listeners.map((l) => `${shCss.cyan}${l}${shCss.end}`).join(', ')} @ ${shCss.bold}${file}${shCss.end}`);
            }
        }
    }
    global.log(`${shCss.green}→ Finished loading command handlers!${shCss.end}`);

    return commandHandlers;
}