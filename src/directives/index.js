import test from './test'
const directives = { test }
export default {
    install (app) {
        for (const [key, val] of Object.entries(directives)) {
            app.directive(key, val)
        }
    }
}
