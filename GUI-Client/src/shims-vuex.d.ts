// vuex-shim.d.ts

import {Store} from 'vuex'
import {GameModeContent, GameModeMenuItem} from "@/interfaces/game-mode";
import {Profile} from "@/interfaces/profile";

declare module '@vue/runtime-core' {
    // Declare your own store states.
    interface State {
        gameModeInfo: {
            started: boolean;
            selectedMode: GameModeMenuItem;
            content: GameModeContent;
        };
        defaultGamemode: GameModeContent;
        user: Profile;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
