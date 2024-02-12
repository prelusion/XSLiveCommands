/* ⚠️ COPIED TO Client/src/renderer/src/types/player.ts ⚠️ - Symlinks don't work yet */
export interface PlayerId {
    value: string,
    platform: 'steam' | 'ms'
}

export interface AuthenticatedPlayer {
    authenticated: true,

    /** Steam ID / MS store ID */
    id: PlayerId,
    /** Steam name / MS store name / Unauthenticated name */
    name: string,
    /** If the user id was resolved to a name by the server */
    resolved: boolean,
}

export interface UnauthenticatedPlayer {
    authenticated: false
}

export type Player = UnauthenticatedPlayer | AuthenticatedPlayer;

export interface RoomPlayer extends AuthenticatedPlayer {
    /** If the player has tyrant permissions */
    tyrant: boolean,
}

/* Alias for readability */
export type SocketId = string;
