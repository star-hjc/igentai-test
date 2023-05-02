import modifyComponents from './modify'
import toolComponents from './tool'
import elementIconComponents from './element-icon'

const components = [modifyComponents, toolComponents, elementIconComponents]

export default {
    install (app) {
        components.forEach(item => {
            app.use(item)
        })
    }
}
