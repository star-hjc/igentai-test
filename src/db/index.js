import Dexie from 'dexie'
const db = new Dexie('')
db.version(1).stores({
    img: '++id, name, base64, path'
})

export default db
