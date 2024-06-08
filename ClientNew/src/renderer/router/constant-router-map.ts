import {RouteRecordRaw} from 'vue-router'
import {Route} from "@renderer/router/routes";

const routes: Array<RouteRecordRaw> = [
    // { path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue") },

    // @formatter:off
    { path: '/',     name: Route.LOADING, component: () => import('@renderer/views/loading/Loading.vue') },
    { path: '/main', name: Route.MAIN,    component: () => import('@renderer/views/main/MainRoom.vue')   },
    // @formatter:on
]

export default routes
