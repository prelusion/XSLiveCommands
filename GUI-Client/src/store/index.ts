import {State} from "@vue/runtime-core";
import {createStore} from "vuex";

export default createStore({
    state: {
        window: "Loading",
    } as State,

    getters: {},
    mutations: {
        changeWindow(state, window: string) {
            state.window = window;
        },
    },
    actions: {},
    modules: {},
});
