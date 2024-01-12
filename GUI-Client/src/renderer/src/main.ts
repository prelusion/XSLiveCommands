"use strict";

// import {select} from "@/../electron/libs/dialog";
import {createApp} from "vue";
import App from "./App.vue";
import store from "./store";

createApp(App)
    .use(store)
    .mount('#app');
