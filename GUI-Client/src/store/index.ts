import {createStore} from 'vuex'
import {State} from "@vue/runtime-core";

export default createStore({
    state: {
        window: "LoadingWindow",
    } as State,

    getters: {},
    mutations: {
        changeWindow(state, window: string) {
            state.window = window;
        }
    },
    actions: {},
    modules: {},
})
