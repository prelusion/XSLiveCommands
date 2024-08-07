import {RouteRecordRaw} from 'vue-router'
import {Route} from "@renderer/router/routes";

const routes: Array<RouteRecordRaw> = [
    // { path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue") },

    // @formatter:off
    { path: '/',             name: Route.LOADING,        component: () => import('@renderer/views/loading/Loading.vue')},
    { path: '/main',         name: Route.MAIN,           component: () => import('@renderer/views/main/Main.vue')},
    { path: '/room/join',    name: Route.JOIN,           component: () => import('@renderer/views/join/Join.vue')},
    { path: '/room/create',  name: Route.CREATE,         component: () => import('@renderer/views/create/Create.vue')},
    { path: '/room/view',    name: Route.ROOM,           component: () => import('@renderer/views/room/Room.vue')},
    { path: '/room/view/cc', name: Route.COMMAND_CENTRE, component: () => import('@renderer/views/command-centre/CommandCentre.vue')},
    // @formatter:on
]

export default routes
