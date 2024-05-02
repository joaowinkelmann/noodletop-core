import { Rand } from "~/utils/randomizer";
import { State } from "~/models/state";

export function auxCommands(state: State, message: string) {
    const [command , op, ...args] = message.split(' ');

    let response = null;

    switch (command) {
        case "/roll":
            response = String(Rand.roll(op, true));
    }

    if (response) {
        state.user.getSocket().send(response);
    }
}