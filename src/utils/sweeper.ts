import { Room } from '~/models/room';
import { StateManager } from './stateManager';
import { Connection } from '~/models/dto/userDTO';
import { shCss } from './common';

// Class containing tasks to remove inactive instances
export class RoomSweeper {
    private static instance: RoomSweeper;

    private constructor() { }

    public static getInstance(): RoomSweeper {
        if (!this.instance) {
            this.instance = new RoomSweeper();
        }
        return this.instance;
    }

    static isInitialized = false;

    /**
     * Starts the sweeping process to check for inactive rooms and perform necessary actions.
     * @env SWEEP_THRESHOLD_MINS - The threshold in minutes to consider a user as inactive. Default is 40 minutes.
     * @env SWEEP_INTERVAL_MINS - The interval in minutes to perform the sweeping. Default is 30 minutes.
     */
    public static startSweeping(): void {
        if (this.isInitialized) {
            return;
        }

        // try to get from env, if it's not 0, otherwise use the default values
        const thresholdMins: number = parseInt(process.env.SWEEP_THRESHOLD_MINS) || 40;
        const retaskMins: number = parseInt(process.env.SWEEP_INTERVAL_MINS) || 30;

        this.checkUserActivity(thresholdMins, retaskMins);
        this.sweepInactiveRooms(thresholdMins, retaskMins);
    
        this.isInitialized = true;
    }

    /**
     * Sweeps inactive users from the rooms.
     * @param thresholdMins - The threshold in minutes to consider a user as inactive. Default is 40 minutes.
     * @param retaskMins - The interval in minutes to perform the sweeping. Default is 30 minutes.
     */
    private static checkUserActivity(thresholdMins: number = 40, retaskMins: number = 30): void {
        global.log(`${shCss.magenta}→ Active Task → Checking user activity every ${retaskMins} minutes. Threshold: ${thresholdMins} minutes.${shCss.end}`);
        setInterval(() => {
            const rooms: Map<string, Room> = StateManager.getInstance().getRooms();
            const now = Date.now();
            rooms.forEach(async (room: Room) => {
                global.log(`Checking users in room ${room.getCode()}`);
                // Disconnect users that have been set as away in the previous execution of this task...
                room.getAwayUsers().forEach(async (user) => {
                    if ((now - user.status.last_seen > thresholdMins * 60 * 1000)) {
                        user.setConnectionStatus(Connection.Exited);
                    }
                });
                // Change the status of active users to away if they have been inactive for a while...
                // Disconnecting them from the server for now
                room.getActiveUsers().forEach(async (user) => {
                    if ((now - user.status.last_seen > thresholdMins * 60 * 1000)) {
                        global.log(`User ${user.getUsername()} is away for ${thresholdMins} minutes`);
                        room.disconnectUser(user, false, 4700, 'Inactivity');
                        user.setConnectionStatus(Connection.Away);
                    }
                });
            });
        },
            retaskMins * 60 * 1000
        );
    }

    // task que verifica se os usuarios ja estão fora da sala por um tempo consideravel e so tem exited. nesse caso, salvamos o que restou da sala e passamos o fumo
    private static sweepInactiveRooms(thresholdMins: number = 40, retaskMins: number = 30): void {
        global.log(`${shCss.magenta}→ Active Task → Sweeping inactive rooms every ${retaskMins} minutes. Threshold: ${thresholdMins} minutes.${shCss.end}`);
        setInterval(() => {
            const rooms: Map<string, Room> = StateManager.getInstance().getRooms();
            const now = Date.now();
            rooms.forEach(async (room: Room) => {
                global.log(`Sweeping room ${room.getCode()}`);
                if (room.countActiveUsers() === 0) {
                    if (now - room.getLastSeen() > thresholdMins * 60 * 1000) {
                        global.log(`Room ${room.getCode()} is inactive and is being archived...`);
                        let saved: boolean = await room.save();
                        if (saved) {
                            global.log(`Sucessfully archived room ${room.getCode()}. Now closing...`);
                            rooms.delete(room.getCode());
                        } else {
                            global.log(`Failed to archive room ${room.getCode()}.`);
                        }
                    }
                }
            });
        },
            retaskMins * 60 * 1000
        );
    }
}