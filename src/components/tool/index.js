import RightClickMenu from './RightClickMenu/index.vue'
import RightClickMenuItem from './RightClickMenu/RightClickMenuItem.vue'
import RightClickMenuItemGroup from './RightClickMenu/RightClickMenuItemGroup.vue'

import MoveGuide from './MoveGuide/index.vue'
import IconLayout from './IconLayout/index.vue'

export default {
    install (app) {
        app.component({ RightClickMenu, RightClickMenuItem, RightClickMenuItemGroup, MoveGuide, IconLayout })
    }
}
