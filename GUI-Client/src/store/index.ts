import {createStore} from 'vuex'
import {Room} from "@/interfaces/rooms";
import {State} from "@vue/runtime-core";
import {Socket} from "socket.io-client";

export default createStore({
    state: {
        socket: null,
        room: null,

        window: "LoadingWindow",
        steamId: "",
        create: {
            filepath: ""
        }
    } as State,
    getters: {
    },
    mutations: {
        changeWindow(state, window: string) {
            state.window = window;

            switch (window) {
                case 'CreateWindow': {
                    state.create.filepath = '';
                }
            }
        },
        setSteamId(state, steamId: string) {
            state.steamId = steamId;
        },
        setRoom(state, room: Room) {
            state.room = room;
        },
        setSocket(state, socket: Socket) {
            state.socket = socket;
        },

        // ----< Create >----
        setFilePath(state, filepath: string) {
            state.create.filepath = filepath;
        },
        clearFilePath(state) {
            state.create.filepath = '';
        }
    },
    actions: {
    },
    modules: {},
})
