import { Room } from '../models/room';
import { StateManager } from './stateManager';
import { Connection } from '../models/dto/userDTO';
import { shCss } from './common';

// Class containing tasks to remove inactive instances
export class RoomSweeper {
    private static instance: RoomSweeper;
    private static auto_save: boolean = false;

    private constructor() {
        // console.log(String(process.env.SWEEP_DO_AUTO_SAVE).toLowerCase());
        // RoomSweeper.auto_save = String(process.env.SWEEP_DO_AUTO_SAVE).toLowerCase() === 'true';
     }

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
        const thresholdMins: number = parseInt(process.env.SWEEP_THRESHOLD_MINS || "40", 10);
        const retaskMins: number = parseInt(process.env.SWEEP_INTERVAL_MINS || "30", 10);
        const autoSave: boolean = String(process.env.SWEEP_DO_AUTO_SAVE).toLowerCase() === 'true';

        // global.log(`Starting sweeping process...`)
        // global.log(`Threshold: ${thresholdMins} minutes`);
        // global.log(`Interval: ${retaskMins} minutes`);
        // global.log(`Auto-save: ${autoSave}`);

        this.checkUserActivity(thresholdMins, retaskMins);
        this.sweepInactiveRooms(thresholdMins, retaskMins, autoSave);
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
    private static sweepInactiveRooms(thresholdMins: number = 40, retaskMins: number = 30, autoSave: boolean = false): void {
        global.log(`${shCss.magenta}→ Active Task → Sweeping inactive rooms every ${retaskMins} minutes. Threshold: ${thresholdMins} minutes.${shCss.end}`);
        setInterval(() => {
            const rooms: Map<string, Room> = StateManager.getInstance().getRooms();
            const now = Date.now();
            rooms.forEach(async (room: Room) => {
                global.log(`Sweeping room ${room.getCode()}`);
                if (room.countActiveUsers() === 0) {
                    if (now - room.getLastSeen() > thresholdMins * 60 * 1000) {
                        global.log(`Room ${room.getCode()} is inactive and is being archived...`);
                        const saved: boolean = await room.save();
                        if (saved) {
                            global.log(`Sucessfully archived room ${room.getCode()}. Now closing...`);
                            // rooms.delete(room.getCode());
                            StateManager.getInstance().deleteRoom(room.getCode());
                        } else {
                            global.log(`${shCss.red}Failed to archive room ${room.getCode()}.${shCss.end}`);
                        }
                    }
                } else if (autoSave) {
                    global.log(`Auto-saving room ${room.getCode()}...`);
                    await room.save();
                }
            });
        },
            retaskMins * 60 * 1000
        );
    }
}