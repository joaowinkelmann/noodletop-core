import { State } from '../models/state';
import { GroqService } from '../services/groqService';

export const listeners = [
    '/groq'
];

export const helpString = '/groq - Chat with a LLM.';

export default async function chat(state: State, input: string) {
    const [command, ...args] = input.split(' ');
    // args = args.join(' ');
    // join args into a single string
    const argString = args.join(' ');

    let response: string = '';
    const groqService = new GroqService();

    // const models = await groqService.getModels();

    const models = await groqService.getModels();
    console.log(models);

    // response += `Models:\r\n`;
    // response += models.join('\r\n

    if (argString) {
        response = await groqService.getResponse(argString);
    } else {
        response = 'Please provide a prompt.';
    }

    if (response) {
        state.user.getSocket().send(response);
    }

}