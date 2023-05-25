export const suffixData = (prefix) => {
    const data = [
        { name: 'filter', detail: '数组过滤' },
        { name: 'find', detail: '数组过滤第一个' },
        { name: 'indexOf', detail: '数组第一个的索引' }
    ]
    return data.map(v => {
        return { label: `${prefix}..${v.name}`, type: 'text', apply: `${prefix}.${v.name}()`, detail: v.detail }
    })
}

export const prefixData = () => {
    const data = [
        { name: 'JSON.parse', detail: 'JSON字符串转换JS对象' },
        { name: 'JSON.stringify', detail: 'JS对象转换JSON字符串' },
        { name: 'consonle.log', detail: '控制台打印' }
    ]
    return data.map(v => {
        return { label: `${v.name}`, type: 'text', apply: `${v.name}()`, detail: v.detail }
    })
}

export const variableData = () => {
    const data = [
        { name: 'JSON', detail: 'JSON对象' },
        { name: 'Array', detail: 'Array对象' },
        { name: 'consonle', detail: '控制台' }
    ]
    return data.map(v => {
        return { label: `${v.name}`, type: 'text', apply: `${v.name}`, detail: v.detail }
    })
}
