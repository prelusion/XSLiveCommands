import {State} from "@vue/runtime-core";
import {createStore} from "vuex";

export default createStore({
    state: {
        window: "Loading",
        data: null,
        connectionOk: false,
        config: {},
    } as State,

    getters: {},
    mutations: {
        changeWindow(state: State, payload: string | {window: string; data: unknown}) {
            if (typeof payload === 'string') {
                state.window = payload;
                state.data = null;
            } else {
                state.window = payload.window;
                state.data = payload.data;
            }
        },
    },
    actions: {},
    modules: {},
});
