/* ⚠️ COPIED FROM Server/src/types/player.ts ⚠️ - Symlinks don't work yet */

export interface PlayerId {
    value: string,
    platform: 'steam' | 'ms'
}

interface BasePlayer {
    /** If the name of the user was authenticated by the server */
    authenticated: boolean,
}

export interface Player extends BasePlayer{
    authenticated: true,

    /** Steam ID / MS store ID */
    id: PlayerId,
    /** Steam name / MS store name / Unauthenticated name */
    name: string,
    /** If the user id was resolved to a name by the server */
    resolved: boolean,
}

export interface UnauthenticatedPlayer extends BasePlayer {
    authenticated: false
}

/* Alias for readability */
export type SocketId = string;

export type PlayerConnections = Record<SocketId, Player>