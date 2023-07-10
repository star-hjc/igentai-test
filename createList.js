
const fs = require('fs')

function createXML (data) {
    return `<?xml version="1.0"?>\n<SendList m_dwCycles="1">\n${data}</SendList>`
}

function createItmeXML (value) {
    return `<tagSendUint bIncreaseID="0" bIncreaseData="0" start_index="0" byte_length="4" iInterval="600" iTimes="3" len="3" szname="" select="1" transmitas="0" obj="${value}" is_canfd="1"></tagSendUint>\n`
}

let xmlContent = ''
for (let i = 9000; i >= 0; i -= 500) {
    console.log(i.toString(16).toUpperCase().padStart(4, 0))
    xmlContent += createItmeXML(`8000000005000000${i.toString(16).toUpperCase().padStart(4, 0).padEnd(136, 0)}`)
}

fs.writeFile('./test.list', createXML(xmlContent), () => {})
