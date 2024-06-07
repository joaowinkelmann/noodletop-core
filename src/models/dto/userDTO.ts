export interface UserStatus {

    // Current possible values:
    //   "active" - User is currently connected, hopefully active and interacting with the Room
    //   "away"   - User's connection was abruptly interrupted for some reason, we keep them in this state for a while, hoping they will return.
    //   "exited" - User has willingly left the Room and is not expected to return. we can safely remove them from the Room.
    connection: Connection;

    last_seen: number; // Date.now(); - Last interaction between the User and the Room
}
export interface UserCosmetics {
    // The user's current cosmetics
    color: string; // hex color '#RRGGBB'
    team: string | null; // team id
    avatar: string | null; // base64 encoded image
}

export enum Connection {
    Away,
    Active,
    Exited
}

export enum Role {
    Player,
    Admin
}