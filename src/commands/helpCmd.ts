import { State } from '~/models/state';

export const listeners = [
    '/help'
];

export const helpString = '/help - Displays this help message.';

export default async function help(state: State, input: string) {
    let response = `Available commands:\r\n`;

    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, './');
    const files = fs.readdirSync(commandsDir);

    for (const file of files) {
        if (file.endsWith('Commands.ts') && file !== 'index.ts') {
            const { helpString } = await import(`./${file}`);
            if (helpString) {
                if (Array.isArray(helpString)) {
                    response += `\r\n\t`; // start by breaking the line, before adding the helpStrings
                    response += helpString.join('\r\n\t');
                } else {
                    response += `\r\n\t${helpString}`;
                }
            }
        }
    }

    response += `\r\n\tWiki: https://winkels7.notion.site/Noodletop-Core-Docs-a6f02baf48e54c9a906d45eae8378c83`;

    state.user.getSocket().send(response);
}