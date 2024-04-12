// Class containing methods to remove and log inactive instances of objects, users and rooms from the server.
import { Room } from '../models/room';

export class Sweeper {
	/**
	 * Sweeps inactive users from the rooms.
	 * @param rooms - The map of rooms.
	 * @param threshold_mins - The threshold in minutes to consider a user as inactive. Default is 10 minutes.
	 * @param retask_mins - The interval in minutes to perform the sweeping. Default is 30 minutes.
	 */
	static sweepInactiveUsers(rooms: Map<string, Room>, threshold_mins: number = 10, retask_mins: number = 30): void {
		global.log(`TASK: Sweeping inactive users every ${retask_mins} minutes`);
		setInterval(() => {
			rooms.forEach((room: Room) => {
				global.log(`Sweeping room ${room.getCode()}`);
				room.getUsers().forEach((user) => {
					if (Date.now() - user.status.last_seen > threshold_mins * 60 * 1000) {
						global.log(`User ${user.getUsername()}@${room.getCode()} removed after being inactive for ${threshold_mins} minutes`);
						room.removeUser(user);
					}
				});
			});
		},
			retask_mins * 60 * 1000
		);
	}

	// Method to remove inactive rooms from the server
	/**
	 * Sweeps inactive rooms based on a given threshold.
	 * @param rooms - The map of rooms to sweep.
	 * @param threshold_mins - The threshold in minutes to consider a room as inactive. Defaults to 60 minutes.
	 * @param retask_mins - The interval in minutes to perform the sweeping. Defaults to 30 minutes.
	 */

	
	
	// TODO: Test if this method wouldn't be better fitted/efficient to be called by sweepInactiveUsers as a callback when a room is emptied
	
	
	static sweepInactiveRooms(rooms: Map<string, Room>, threshold_mins: number = 60, retask_mins: number = 30): void {
		global.log(`TASK: Sweeping inactive rooms every ${retask_mins} minutes`);
		setInterval(() => {
			rooms.forEach((room: Room) => {
				if (room.getUsers().size === 0 && Date.now() - room.getLastSeen() > threshold_mins * 60 * 1000) {
					global.log(`Room ${room.getCode()} has been inactive for ${threshold_mins} minutes, self-destructing...`);
					room.selfDestruct();
					rooms.delete(room.getCode());
				}
			});
		},
			retask_mins * 60 * 1000
		);
	}
}
