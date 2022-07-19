// vuex-shim.d.ts

import {Store} from "vuex";

declare module "@vue/runtime-core" {
    // Declare your own store states.
    interface State {
        data: unknown;
        window: string;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
