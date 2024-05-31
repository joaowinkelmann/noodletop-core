export interface RoomSettings {
    isPublic: boolean;
    capacity: number;
    password?: string; // If the room is password protected, the password will be stored here.
}