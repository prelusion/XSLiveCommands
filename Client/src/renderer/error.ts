import type { App } from 'vue'
import { nextTick } from "vue"

export const errorHandler = (App: App<Element>) => {
    App.config.errorHandler = (err, vm, info) => {
        nextTick(() => {
            if (process.env.NODE_ENV === 'development') {
                console.group('%c >>>>>> Error Message >>>>>>', 'color:red')
                console.log(`%c ${info}`, 'color:blue')
                console.groupEnd()
                console.group('%c >>>>>> The Vue instance where the error occurred >>>>>>', 'color:green')
                console.log(vm)
                console.groupEnd()
                console.group('%c >>>>>> Cause and location of the error >>>>>>', 'color:red')
                console.error(err)
                console.groupEnd()
            }
        })
    }

}
