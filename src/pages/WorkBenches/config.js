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
        { label: 'console.log', detail: '控制台打印' },
        { label: 'adb.tap', detail: '屏幕点击(x, y)' },
        { label: 'adb.swipe', detail: '屏幕拖动(x, y, toX, toY, time)' },
        { label: 'adb.keyevent', detail: '手机按键(key)' },
        { label: 'adb.input', detail: '手机输入' },
        { label: 'adb.clearText', detail: '清空输入框' },
        { label: 'adb.getRunAppisActivity', detail: '获取运行在后台的Activity' },
        { label: 'adb.startApp', detail: '根据Activity启动App' },
        { label: 'adb.command', detail: `命令行，例：await adb.command(['input','tap',943,506])` }
    ]
    return data.map(v => {
        return { label: `${v.label}`, type: 'text', apply: `${v.label}${v.other || '()'}`, detail: v.detail }
    })
}

export const variableData = () => {
    const data = [
        { label: 'adb', detail: 'ADB对象' },
        { label: 'log', detail: 'log' },
        { label: 'log.log', detail: '4级bug' },
        { label: 'log.success', detail: '通过' },
        { label: 'log.info', detail: '3级bug' },
        { label: 'log.warning', detail: '2级bug' },
        { label: 'log.danger', detail: '1级bug' },
        { label: 'rand', detail: '随机数' },
        { label: 'await', detail: '等待' },
        { label: 'async', detail: '异步标记' },
        { label: 'delay', detail: '休眠 delay(time)', other: `()` },
        { label: 'for', detail: 'loop', other: ` (let i = 0; i < bound; i++) {\n\n}\n` },
        { label: 'for', detail: 'in loop', other: ` (let name in collection) {\n\n}\n` },
        { label: 'for', detail: 'of loop', other: ` (let name of collection) {\n\n}\n` },
        { label: 'while', detail: 'loop', other: ` () {\n\n}\n` },
        { label: 'JSON', detail: 'JSON对象' },
        { label: 'Array', detail: 'Array对象' },
        { label: 'arrayMatched', detail: '数组对比，callback（与第一个数组对比第一个数组多余的值{Array},与第一个数组对比第一个数组不存在的值{Array}）' },
        { label: 'console', detail: '控制台' },
        { label: 'ocr', detail: 'ocr({lang:{语言},range:[t,l,w,h]},图片Base64？)' },
        { label: 'cropImg', detail: 'cropImg({lang:{语言},range:[t,l,w,h]},图片Base64？)' },
        { label: 'findImage', detail: 'findImage(图片地址)' },
        { label: 'function', detail: 'definition', other: ` name(){\n\n}\n` },
        { label: 'querySelector', detail: '根据属性获取屏幕节点', other: `()` },
        { label: 'querySelectorAll', detail: '根据属性获取屏幕节点', other: `()` },
        { label: 'getXY', detail: '获取节点的坐标', other: `()` },
        { label: 'getRange', detail: '获取节点的范围:[左上角X，左上角Y，右下角X，右下角Y]', other: `()` },
        { label: 'getProp', detail: '获取节点的所有属性，', other: `()` },
        { label: 'loopByNum', detail: '根据次数循环，loopByNum(函数,循环次数,(默认可以不填[不填继续执行案例]，填写后，超出次数后抛出错误,进行下一次案例...))', other: `()` },
        { label: 'loopByTime', detail: '根据时间循环，loopByNum(函数,循环时间,(默认可以不填[不填继续执行案例]，填写后，超出次数后抛出错误,进行下一次案例...))', other: `()` },
        { label: 'getProps', detail: '获取多个节点的所有属性', other: `()` },
        { label: 'clickId', detail: '根据资源ID单击', other: `()` },
        { label: 'clickText', detail: '根据文本内容单击', other: `()` },
        { label: 'select', detail: '根据属性获取屏幕节点', other: `()` },
        { label: 'selectAll', detail: '根据属性获取屏幕节点', other: `()` }
    ]
    return data.map(v => {
        return { label: `${v.label}`, type: 'text', apply: `${v.label}${v.other || ''}`, detail: v.detail }
    })
}

export const keyevent = [
    {
        key: 'KEYCODE_APP_SWITCH',
        label: `后台APP`
    },
    {
        key: 'KEYCODE_HOME',
        label: `Home`
    },
    {
        key: 'KEYCODE_POWER',
        label: `电源键`
    },
    {
        key: 'KEYCODE_MENU',
        label: `菜单键`
    },
    {
        key: 'KEYCODE_BACK',
        label: `返回键`
    },
    {
        key: 'KEYCODE_SEARCH',
        label: `搜索键`
    },
    {
        key: 'KEYCODE_CAMERA',
        label: `拍照键`
    },
    {
        key: 'KEYCODE_CALL',
        label: `拨号键`
    },
    {
        key: 'KEYCODE_FOCUS',
        label: `拍照对焦键`
    },
    {
        key: 'KEYCODE_ENDCALL',
        label: `挂机键`
    },
    {
        key: 'KEYCODE_NOTIFICATION',
        label: `通知键`
    },
    {
        key: 'KEYCODE_MUTE',
        label: `话筒静音键`
    },
    {
        key: 'KEYCODE_VOLUME_MUTE',
        label: `扬声器静音键`
    },
    {
        key: 'KEYCODE_VOLUME_UP',
        label: `音量增加键`
    },
    {
        key: 'KEYCODE_VOLUME_DOWN',
        label: `音量减小键`
    },
    {
        key: 'KEYCODE_ENTER',
        label: `回车键`
    },
    {
        key: 'KEYCODE_ESCAPE',
        label: `ESC键`
    },
    {
        key: 'KEYCODE_DPAD_CENTER',
        label: `导航键 确定键`
    },
    {
        key: 'KEYCODE_DPAD_UP',
        label: `导航键 向上`
    },
    {
        key: 'KEYCODE_DPAD_DOWN',
        label: `导航键 向下`
    },
    {
        key: 'KEYCODE_DPAD_LEFT',
        label: `导航键 向左`
    },
    {
        key: 'KEYCODE_DPAD_RIGHT',
        label: `导航键 向右`
    },
    {
        key: 'KEYCODE_MOVE_HOME',
        label: `光标移动到开始键`
    },
    {
        key: 'KEYCODE_MOVE_END',
        label: `光标移动到末尾键`
    },
    {
        key: 'KEYCODE_PAGE_UP',
        label: `向上翻页键`
    },
    {
        key: 'KEYCODE_PAGE_DOWN',
        label: `向下翻页键`
    },
    {
        key: 'KEYCODE_DEL',
        label: `退格键`
    },
    {
        key: 'KEYCODE_FORWARD_DEL',
        label: `删除键`
    },
    {
        key: 'KEYCODE_INSERT',
        label: `插入键`
    },
    {
        key: 'KEYCODE_TAB',
        label: `Tab键`
    },
    {
        key: 'KEYCODE_NUM_LOCK',
        label: `小键盘锁`
    },
    {
        key: 'KEYCODE_CAPS_LOCK',
        label: `大写锁定键`
    },
    {
        key: 'KEYCODE_BREAK',
        label: `Break/Pause键`
    },
    {
        key: 'KEYCODE_SCROLL_LOCK',
        label: `滚动锁定键`
    },
    {
        key: 'KEYCODE_ZOOM_IN',
        label: `放大键`
    },
    {
        key: 'KEYCODE_ZOOM_OUT',
        label: `缩小键`
    },
    {
        key: 'KEYCODE_0',
        label: `按键"0"`
    },
    {
        key: 'KEYCODE_1',
        label: `按键"1"`
    },
    {
        key: 'KEYCODE_2',
        label: `按键"2"`
    },
    {
        key: 'KEYCODE_3',
        label: `按键"3"`
    },
    {
        key: 'KEYCODE_4',
        label: `按键"4"`
    },
    {
        key: 'KEYCODE_5',
        label: `按键"5"`
    },
    {
        key: 'KEYCODE_6',
        label: `按键"6"`
    },
    {
        key: 'KEYCODE_7',
        label: `按键"7"`
    },
    {
        key: 'KEYCODE_8',
        label: `按键"8"`
    },
    {
        key: 'KEYCODE_9',
        label: `按键"9"`
    },
    {
        key: 'KEYCODE_A',
        label: `按键"A"`
    },
    {
        key: 'KEYCODE_B',
        label: `按键"B"`
    },
    {
        key: 'KEYCODE_C',
        label: `按键"C"`
    },
    {
        key: 'KEYCODE_D',
        label: `按键"D"`
    },
    {
        key: 'KEYCODE_E',
        label: `按键"E"`
    },
    {
        key: 'KEYCODE_F',
        label: `按键"F"`
    },
    {
        key: 'KEYCODE_G',
        label: `按键"G"`
    },
    {
        key: 'KEYCODE_H',
        label: `按键"H"`
    },
    {
        key: 'KEYCODE_I',
        label: `按键"I"`
    },
    {
        key: 'KEYCODE_J',
        label: `按键"J"`
    },
    {
        key: 'KEYCODE_K',
        label: `按键"K"`
    },
    {
        key: 'KEYCODE_L',
        label: `按键"L"`
    },
    {
        key: 'KEYCODE_M',
        label: `按键"M"`
    },
    {
        key: 'KEYCODE_N',
        label: `按键"N"`
    },
    {
        key: 'KEYCODE_O',
        label: `按键"O"`
    },
    {
        key: 'KEYCODE_P',
        label: `按键"P"`
    },
    {
        key: 'KEYCODE_Q',
        label: `按键"Q"`
    },
    {
        key: 'KEYCODE_R',
        label: `按键"R"`
    },
    {
        key: 'KEYCODE_S',
        label: `按键"S"`
    },
    {
        key: 'KEYCODE_T',
        label: `按键"T"`
    },
    {
        key: 'KEYCODE_U',
        label: `按键"U"`
    },
    {
        key: 'KEYCODE_V',
        label: `按键"V"`
    },
    {
        key: 'KEYCODE_W',
        label: `按键"W"`
    },
    {
        key: 'KEYCODE_X',
        label: `按键"X"`
    },
    {
        key: 'KEYCODE_Y',
        label: `按键"Y"`
    },
    {
        key: 'KEYCODE_Z',
        label: `按键"Z"`
    },
    {
        key: 'KEYCODE_PLUS',
        label: `按键"+"`
    },
    {
        key: 'KEYCODE_MINUS',
        label: `按键"-"`
    },
    {
        key: 'KEYCODE_STAR',
        label: `按键"*"`
    },
    {
        key: 'KEYCODE_SLASH',
        label: `按键"/"`
    },
    {
        key: 'KEYCODE_EQUALS',
        label: `按键"="`
    },
    {
        key: 'KEYCODE_AT',
        label: `按键"@"`
    },
    {
        key: 'KEYCODE_POUND',
        label: `按键"#"`
    },
    {
        key: 'KEYCODE_APOSTROPHE',
        label: `按键"'" (单引号)`
    },
    {
        key: 'KEYCODE_BACKSLASH',
        label: `按键"\"`
    },
    {
        key: 'KEYCODE_COMMA',
        label: `按键","`
    },
    {
        key: 'KEYCODE_PERIOD',
        label: `按键"."`
    },
    {
        key: 'KEYCODE_LEFT_BRACKET',
        label: `按键"["`
    },
    {
        key: 'KEYCODE_RIGHT_BRACKET',
        label: `按键"]"`
    },
    {
        key: 'KEYCODE_SEMICOLON',
        label: `按键";"`
    },
    {
        key: 'KEYCODE_GRAVE',
        label: '按键"`"'
    },
    {
        key: 'KEYCODE_SPACE',
        label: `空格键`
    },
    {
        key: 'KEYCODE_MEDIA_PLAY',
        label: `多媒体键 播放`
    },
    {
        key: 'KEYCODE_MEDIA_STOP',
        label: `多媒体键 停止`
    },
    {
        key: 'KEYCODE_MEDIA_PAUSE',
        label: `多媒体键 暂停`
    },
    {
        key: 'KEYCODE_MEDIA_PLAY_PAUSE',
        label: `多媒体键 播放/暂停`
    },
    {
        key: 'KEYCODE_MEDIA_FAST_FORWARD',
        label: `多媒体键 快进`
    },
    {
        key: 'KEYCODE_MEDIA_REWIND',
        label: `多媒体键 快退`
    },
    {
        key: 'KEYCODE_MEDIA_NEXT',
        label: `多媒体键 下一首`
    },
    {
        key: 'KEYCODE_MEDIA_PREVIOUS',
        label: `多媒体键 上一首`
    },
    {
        key: 'KEYCODE_MEDIA_CLOSE',
        label: `多媒体键 关闭`
    },
    {
        key: 'KEYCODE_MEDIA_EJECT',
        label: `多媒体键 弹出`
    },
    {
        key: 'KEYCODE_MEDIA_RECORD',
        label: `多媒体键 录音`
    }
]
