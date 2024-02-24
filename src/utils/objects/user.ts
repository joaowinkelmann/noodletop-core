import { Socket } from "../state";

export type User = {
	socket: Socket;
	pseudo: string;
};
