import {defineStore} from 'pinia'
import {ConfigStructLatest} from "../../../shared/src/types/config";
import {assert} from "../../../shared/src/util/general";
import {toRaw} from "vue";
import {CONFIG_VERSION} from "@renderer/versions";

interface StateType {
    connectionOk: boolean;
    config: ConfigStructLatest | null;
    tyrantRequest: {
        roomId: string;
        code: string;
    };
}

export const useMainStore = defineStore('main', {
    state: (): StateType => ({
        connectionOk: false,
        config: null,
        tyrantRequest: {
            roomId: '',
            code: '',
        },
    }),
    getters: {
        getConnectionOk: (state): boolean => state.connectionOk,
    },
    actions: {
        PATCH_CONFIG<K extends keyof ConfigStructLatest>(key: K, value: ConfigStructLatest[K]) {
            assert(this.config);

            this.config[key] = value;

            window.config.writeConfig(toRaw(this.config), parseFloat(CONFIG_VERSION));
        }
    }
})
