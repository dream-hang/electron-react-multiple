import {isElectron} from '../common';
import LocalStorage from 'lowdb/adapters/LocalStorage'

const low = require('lowdb')
const path = require('path')

let STORE_PATH = ""
let db = ""
if (isElectron()) {
    STORE_PATH = window.remote.app.getPath('userData') 
    if (process.type !== 'renderer') {
        if (!window.fs.pathExistsSync(STORE_PATH)) { // 如果不存在路径
            window.fs.mkdirpSync(STORE_PATH) // 就创建
        }
    }
    const adapter = new window.FileSync(path.join(STORE_PATH, '/db.json')) // 初始化lowdb读写的json文件名以及存储路径
    db = low(adapter)
} else {
    const adapter = new LocalStorage('db')
    db = low(adapter)
}

const DB = {}

DB.get = (name) => {
    if (!db.has(name).value()) { // 先判断该值存不存在
        db.set(name, '').write() // 不存在就创建
    }
    return db.read().get(name).value();
}

DB.getDefault = (name , defaultValue) => {
    return db.defaults({[name]: defaultValue}).get(name).value();
}

DB.set = (name, value) => {
    db.read().set(name , value).write();
}

export default DB // 暴露出去
