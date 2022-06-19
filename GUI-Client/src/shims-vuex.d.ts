// vuex-shim.d.ts

import {Store} from 'vuex'
import {Socket} from "socket.io-client";
import {Room} from "@/interfaces/rooms";

declare module '@vue/runtime-core' {
    // Declare your own store states.
    interface State {
        socket: Socket | null;
        room: Room | null;

        window: string;
        steamId: string;
        create: {
            filepath: string;
        };
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
