import { Socket } from "../utils/state";

export type User = {
	socket: Socket;
	pseudo: string;
};
