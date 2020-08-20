import {isElectron} from '../common';
import LocalStorage from 'lowdb/adapters/LocalStorage'

const low = require('lowdb')
const path = require('path')

let STORE_PATH = ""
let db = ""
if (isElectron()) {
    STORE_PATH = window.remote.app.getPath('userData') 
    if (process.type !== 'renderer') {
        if (!window.fs.pathExistsSync(STORE_PATH)) { 
            window.fs.mkdirpSync(STORE_PATH) 
        }
    }
    const adapter = new window.FileSync(path.join(STORE_PATH, '/db.json'))
    db = low(adapter)
} else {
    const adapter = new LocalStorage('db')
    db = low(adapter)
}

const DB = {}

DB.get = (name) => {
    if (!db.has(name).value()) {
        db.set(name, '').write()
    }
    return db.read().get(name).value();
}

DB.getDefault = (name , defaultValue) => {
    return db.defaults({[name]: defaultValue}).get(name).value();
}

DB.set = (name, value) => {
    db.read().set(name , value).write();
}

export default DB 
