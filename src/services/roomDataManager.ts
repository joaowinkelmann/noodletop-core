import { Db } from '~/database';
import { Room } from '../models/room';

export class RoomDataManager {
    constructor(private db: Db) {}

    async saveRoom(room: Room) {
        // Convert the room to a format suitable for saving...
        const roomDataToSave = this.convertRoomToData(room);

        // Save the room data...
        await this.db.insert('rooms', roomDataToSave);
    }

    async loadRoom(id: string) {
        // Load the room data...
        const roomDataToLoad = await this.db.findOne('rooms', { id });

        // Convert the data to a Room instance...
        return this.convertDataToRoom(roomDataToLoad);
    }

    private convertRoomToData(room: Room) {
        // Convert the room to a format suitable for saving...
        return {
            id: room.getSessionId(),
            code: room.getCode(),
            users: Array.from(room.getUsers()).map(user => user.getId())
            // Other properties...
        };
    }

    private convertDataToRoom(data: any) {
        // Convert the data to a Room instance...
        const room = new Room(data.code);

        // Other properties...

        return room;
    }

    // Other methods for backing up and importing data...
}