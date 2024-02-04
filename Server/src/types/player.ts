export interface Player {
    /** Steam ID / MS store ID */
    id: string,
    /** Steam name / MS store name / Unauthenticated name */
    name: string,
    /** If the name of the user was authenticated by the server */
    authenticated?: boolean,
}

/* Socket ID */
export type PlayerConnections = Record<string, Player>