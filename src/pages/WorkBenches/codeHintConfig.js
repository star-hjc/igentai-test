export const suffixData = (prefix) => {
    const data = [
        { label: 'filter', detail: '数组过滤' },
        { label: 'find', detail: '数组过滤第一个' },
        { label: 'indexOf', detail: '数组第一个的索引' },
        { label: 'querySelector', detail: '根据属性获取屏幕节点' },
        { label: 'querySelectorAll', detail: '根据属性获取屏幕节点' },
        { label: 'getAttribute', detail: '获取节点指定属性:text...' }

    ]
    return data.map(v => {
        return { label: `${prefix}..${v.label}`, type: 'text', apply: `${prefix}.${v.label}${v.other || '()'}`, detail: v.detail }
    })
}

export const prefixData = () => {
    const data = [
        { label: 'JSON.parse', detail: 'JSON字符串转换JS对象' },
        { label: 'JSON.stringify', detail: 'JS对象转换JSON字符串' },
        { label: 'consonle.log', detail: '控制台打印' },
        { label: 'adb.tap', detail: '屏幕点击(x, y)' },
        { label: 'adb.swipe', detail: '屏幕拖动(x, y, toX, toY, time)' },
        { label: 'adb.keyevent', detail: '手机按键(key)' }
    ]
    return data.map(v => {
        return { label: `${v.label}`, type: 'text', apply: `${v.label}${v.other || '()'}`, detail: v.detail }
    })
}

export const variableData = () => {
    const data = [
        { label: 'adb', detail: 'ADB对象' },
        { label: 'rand', detail: '随机数' },
        { label: 'await', detail: '等待' },
        { label: 'async', detail: '异步标记' },
        { label: 'for', detail: 'loop', other: ` (let i = 0; i < bound; i++) {\n\n}\n` },
        { label: 'for', detail: 'of loop', other: ` (let name of collection) {\n\n}\n` },
        { label: 'while', detail: 'loop', other: ` () {\n\n}\n` },
        { label: 'JSON', detail: 'JSON对象' },
        { label: 'Array', detail: 'Array对象' },
        { label: 'consonle', detail: '控制台' },
        { label: 'function', detail: 'definition', other: ` name(){\n\n}\n` },
        { label: 'querySelector', detail: '根据属性获取屏幕节点', other: `()` },
        { label: 'querySelectorAll', detail: '根据属性获取屏幕节点', other: `()` },
        { label: 'getXY', detail: '获取节点的坐标', other: `()` },
        { label: 'getProp', detail: '获取节点的所有属性', other: `()` },
        { label: 'getProps', detail: '获取多个节点的所有属性', other: `()` }
    ]
    return data.map(v => {
        return { label: `${v.label}`, type: 'text', apply: `${v.label}${v.other || ''}`, detail: v.detail }
    })
}
