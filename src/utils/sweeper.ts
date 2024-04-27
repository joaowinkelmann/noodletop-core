// Class containing methods to remove and log inactive instances of objects, users and rooms from the server.
import { Room } from '../models/room';

export class Sweeper {
    /**
     * Sweeps inactive users from the rooms.
     * @param rooms - The map of rooms.
     * @param thresholdMins - The threshold in minutes to consider a user as inactive. Default is 10 minutes.
     * @param retaskMins - The interval in minutes to perform the sweeping. Default is 30 minutes.
     */
    static sweepInactiveUsers(rooms: Map<string, Room>, thresholdMins: number = 10, retaskMins: number = 30): void {
        global.l(`TASK: Sweeping inactive users every ${retaskMins} minutes`);
        setInterval(() => {
            rooms.forEach((room: Room) => {
                global.l(`Sweeping room ${room.getCode()}`);
                room.getUsers().forEach((user) => {
                    if (Date.now() - user.status.last_seen > thresholdMins * 60 * 1000) {
                        global.l(`User ${user.getUsername()}@${room.getCode()} removed after being inactive for ${thresholdMins} minutes`);
                        room.removeUser(user);
                    }
                });
            });
        },
            retaskMins * 60 * 1000
        );
    }

    // Method to remove inactive rooms from the server
    /**
     * Sweeps inactive rooms based on a given threshold.
     * @param rooms - The map of rooms to sweep.
     * @param thresholdMins - The threshold in minutes to consider a room as inactive. Defaults to 60 minutes.
     * @param retaskMins - The interval in minutes to perform the sweeping. Defaults to 30 minutes.
     */



    // TODO: Test if this method wouldn't be better fitted/efficient to be called by sweepInactiveUsers as a callback when a room is emptied


    static sweepInactiveRooms(rooms: Map<string, Room>, thresholdMins: number = 60, retaskMins: number = 30): void {
        global.l(`TASK: Sweeping inactive rooms every ${retaskMins} minutes`);
        setInterval(() => {
            rooms.forEach((room: Room) => {
                if (room.getUsers().size === 0 && Date.now() - room.getLastSeen() > thresholdMins * 60 * 1000) {
                    global.l(`Room ${room.getCode()} has been inactive for ${thresholdMins} minutes, self-destructing...`);
                    room.selfDestruct();
                    rooms.delete(room.getCode());
                }
            });
        },
        retaskMins * 60 * 1000
        );
    }
}
