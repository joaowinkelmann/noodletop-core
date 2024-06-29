import { Db } from '../database';
import { Room } from '../models/room';
import { State } from '../models/state';
import { Rand } from '../utils/randomizer';
import { StateManager } from '../utils/stateManager';

export class RoomDataManager {
    constructor(private db: Db) {}

    static async saveRoom(room: Room): Promise<boolean> {
        // Convert the room to a format suitable for saving...
        const roomDataToSave = this.convertRoomToData(room);
        const db = new Db();
        const connected = await db.connect();

        if (!connected) {
            return false;
        }

        // Save the room data...
        return await db.upsOne('rooms', { id: room.getSessionId() }, roomDataToSave);
    }

    async loadRoom(id: string) {
        // Load the room data...
        const roomDataToLoad = await this.db.getOne('rooms', { id });

        // Convert the data to a Room instance...
        return this.convertDataToRoom(roomDataToLoad);
    }

    private static convertRoomToData(room: Room): Record<string, any> {
        // Convert the room to a format suitable for saving...
        return {
            id: room.getSessionId(),
            code: room.getCode(),
            date_ins: Rand.dateFromId(room.getSessionId()),
            date_upd: room.getLastSeenDate(),
            users: Array.from(room.getUsers()).map(user => user.getUsername()),
            objects: room.getAllObj()
            // Other properties...
        };
    }

    public static roomExportApi(roomCode: string) {
        // JSONify a room and return it
        const room = StateManager.getInstance().getRoom(roomCode) as Room;
        if (!room) return { error: 'Room not found' };
        // let cap = room.getCapacity();
        // global.log(cap);
        // global.log(rooms);


        if (room) {
            return this.convertRoomToData(room);
        } else {
            return { error: 'Room not found' };
        }
    }

    private convertDataToRoom(data: any) {
        // Convert the data to a Room instance...
        const room = new Room(data.code);

        // Other properties...

        return room;
    }

    public getAllPublicRooms() {
        StateManager.getInstance().getPublicRooms();
    }
}