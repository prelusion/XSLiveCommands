export interface SteamPlayerSummary {
    avatar: string;
    avatarfull: string;
    avatarhash: string;
    avatarmedium: string;
    commentpermission: number;
    communityvisibilitystate: number;
    lastlogoff: number;
    loccountrycode: string;
    personaname: string;
    personastate: number;
    personastateflags: number;
    primaryclanid: string;
    profilestate: number;
    profileurl: string;
    steamid: string;
    timecreated: number;
}

export interface SteamPlayerSummaryResponse {
    response: {
        players: SteamPlayerSummary[]
    }
}