import { Room } from '~/models/room';

// Class containing methods to remove inactive instances
export class Sweeper {
    /**
     * Sweeps inactive users from the rooms.
     * @param rooms - The map of rooms.
     * @param thresholdMins - The threshold in minutes to consider a user as inactive. Default is 40 minutes.
     * @param retaskMins - The interval in minutes to perform the sweeping. Default is 30 minutes.
     */
    static sweepInactiveUsers(rooms: Map<string, Room>, thresholdMins: number = 40, retaskMins: number = 30): void {
        global.log(`TASK: Sweeping inactive users every ${retaskMins} minutes`);
        setInterval(() => {
            const now = Date.now();
            rooms.forEach(async (room: Room) => {
                global.log(`Sweeping room ${room.getCode()}`);
                room.getUsers().forEach(async (user) => {
                    if (now - user.status.last_seen > thresholdMins * 60 * 1000) {
                        global.log(`User ${user.getUsername()}@${room.getCode()} removed after being inactive for ${thresholdMins} minutes`);
                        room.disconnectUser(user, true, 4700, 'Inactivity');
                        if (room.isEmpty()) {
                            await room.save();
                            global.log(`Room ${room.getCode()} is empty and will be closed`);
                            rooms.delete(room.getCode());
                        }
                    }
                });
            });
        },
            retaskMins * 60 * 1000
        );
    }
}
