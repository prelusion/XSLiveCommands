// vuex-shim.d.ts

import {Store} from "vuex";
import {ConfigFileFormatV1} from "./interfaces/config";

declare module "@vue/runtime-core" {
    // Declare your own store states.
    interface State {
        data: unknown;
        window: string;
        connectionOk: boolean;
        config: ConfigFileFormatV1;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
