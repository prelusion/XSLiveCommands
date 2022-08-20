// vuex-shim.d.ts

import {Store} from "vuex";
import {ConfigFileFormatNewest} from "./interfaces/config";

declare module "@vue/runtime-core" {
    // Declare your own store states.
    interface State {
        data: unknown;
        window: string;
        connectionOk: boolean;
        config: ConfigFileFormatNewest | null;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
