import {Store} from 'vuex'
import {ConfigStructLatest} from "../../shared/src/types/config";

declare module '@vue/runtime-core' {
    // Declare your own store states.
    interface State {
        count: number
        data: unknown;
        window: string;
        connectionOk: boolean;
        config: ConfigStructLatest | null;
        tyrantRequest: {
            roomId: string;
            code: string;
        };
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}