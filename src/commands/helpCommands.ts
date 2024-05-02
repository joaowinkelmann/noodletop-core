import { State } from "~/models/state";

export function helpCommands(state: State, message: string) {
    // const [command , op, ...args] = message.split(' ');

    let response = null;

    // if (!op) {
        response = `Available commands: \r\n\t/help Command list\r\n\t/list Room user list\r\n\t/quit Quit the room\r\n\t/leave Leave the room temporarily \r\n\t/obj Perform operations with objects. Usage: /obj [read|create|update|delete] [id] [{"property": "value"}] \r\n\t/user Perform operations with your own user. Usage: /user [setUsername|info] [newUsername] \r\n\t/room Perform operations within the room. Usage: /room [set|close|info|list|kick] [username] \r\n\t/roll Roll dice. Usage: /roll [dice notation (2d6+3)] [show rolls (true|false)] \r\n\t/team Perform operations with teams. Usage: /team [create|join|leave|list] [teamName] \r\n\t/debug Developer debug command \r\n\tWiki: https://winkels7.notion.site/Noodletop-WebSocket-Docs-a6f02baf48e54c9a906d45eae8378c83`;
    // }

    // in the future, perhaps we could paginate the help commands, or even grab that information dinamically from inside the command handlers themselves. (e.g. /help room 2 -> gets the second page of the room commands help)

    if (response) {
        state.user.getSocket().send(response);
    }
}