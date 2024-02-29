// import { Socket } from "../utils/state";
import { ServerWebSocket } from "bun";

export type User = {
	// socket: Socket; // old
	socket: ServerWebSocket<unknown>;
	pseudo: string;
};