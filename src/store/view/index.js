import { defineStore } from 'pinia'

export default defineStore({
    /** id必填，且需要唯一 */
    id: 'view',
    state: () => {
        return {
            assetsPath: ''
        }
    },
    actions: {
        setData (partial) {
            this.$patch(partial)
        }
    },
    getters: {
        /** 应用当前设置 */
        getState: (state) => {
            return (key) => {
                return key ? state[key] : { ...state }
            }
        }
    }
})
