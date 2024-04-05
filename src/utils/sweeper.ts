// Class containing methods to remove and log inactive instances of objects, users and rooms from the server.
import { Room } from '../models/room';

export class Sweeper {
	// Method to remove inactive users from a room
	static sweepInactiveUsers(rooms: Map<string, Room>, threshold_mins: number = 10, retask_mins: number = 30): void {
		// console.log(`Sweeping inactive users every ${retask_mins} minutes`)
		setInterval(() => {
			rooms.forEach((room: Room) => {
				//console.log(`Sweeping room ${room.getCode()}`)
				room.getUsers().forEach((user) => {
					if (Date.now() - user.status.last_seen > threshold_mins * 60 * 1000) {
						// console.log(`User ${user.username} has been inactive for ${threshold_mins} minutes`)
						room.removeUser(user);
					}
				});
			});
		},
			retask_mins * 60 * 1000
		);
	}

	// Method to remove inactive rooms from the server
	static sweepInactiveRooms(rooms: Map<string, Room>, threshold_mins: number = 60): void {
		//console.log(`Sweeping inactive rooms every ${threshold_mins} minutes`)
		setInterval(() => {
			rooms.forEach((room: Room) => {
				if (room.getUsers().size === 0 && Date.now() - room.getLastSeen() > threshold_mins * 60 * 1000) {
					//console.log(`Room ${room.getCode()} has been inactive for ${threshold_mins} minutes`)
					room.selfDestruct();
					rooms.delete(room.getCode());
				}
			});
		},
			threshold_mins * 60 * 1000
		);
	}
}
