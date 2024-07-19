/* ⚠️ COPIED TO Client/src/shared/src/types ⚠️ - Symlinks don't work yet */

/* Alias for readability */
export type SocketId = string;

export interface PlatformUser {
    userId: string,
    type: 'steam' | 'ms'
}

interface BaseUser {
    sktId: SocketId,
    authenticated: boolean;
}

export interface AuthenticatedUser extends BaseUser {
    authenticated: true,

    /** Steam ID / MS store ID */
    platform: PlatformUser,
    /** Steam name / MS store name / Unauthenticated name */
    name: string,
    /** If the user id was resolved to a name by the server */
    resolved: boolean,
}

export interface UnauthenticatedUser extends BaseUser {
    authenticated: false
}

export type User = UnauthenticatedUser | AuthenticatedUser;
