import {State} from "vue";
import {createStore} from "vuex";
import {ConfigFileFormatNewest} from "../../../shared/src/types/config";
import {CONFIG_VERSION} from "../versions";
import {toRaw} from "vue";
import {isString} from "../util/general";
import {assert} from "../../../shared/src/util/general";

export default createStore({
    state: {
        window: "Loading",
        data: null,
        connectionOk: false,
        config: null,
    } as State,
    getters: {},
    mutations: {
        changeWindow(state: State, payload: string | { window: string; data: unknown }) {
            if (isString(payload)) {
                state.window = payload;
                state.data = null;
            } else {
                state.window = payload.window;
                state.data = payload.data;
            }
        },
        patchConfig<K extends keyof ConfigFileFormatNewest>(state: State, payload: { key: K; value: ConfigFileFormatNewest[K] }) {
            assert(state.config);

            state.config[payload.key] = payload.value;
            window.config.writeConfig(toRaw(state.config), parseFloat(CONFIG_VERSION));
        }
    },
    actions: {},
    modules: {},
});
