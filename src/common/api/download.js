import axios from 'axios'
import {isElectron} from '../common';

const axiosHttp = axios.create({
    adapter: require('axios/lib/adapters/http')
})
const unpackedFolderName = 'app.asar.unpacked'
let unpackPath = ""
let appPath = ""

if (isElectron()) {
    unpackPath = window.remote.app.getAppPath().substring(0,window.remote.app.getAppPath().lastIndexOf('\\') + 1) + unpackedFolderName
    appPath = unpackPath
}

/**
 * 下载文件 (build package)
 * @param {String} url 
 */
const download = (url) => {
    return new Promise ((resolve, reject) => {
        axiosHttp({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(function (response) {
            let stream = window.fs.createWriteStream(unpackPath + response.headers['content-disposition'].split('=')[1]);
            response.data.pipe(stream);
            stream.on('finish', () => {
                // 执行解压更新操作
                admZipFile(response,resolve)
            });
            stream.on('error', err =>{
                reject(err)
            });
        })
    })
}
/**
 * 解压并替换文件，解压成功后删除压缩文件
 */
const admZipFile = (response, resolve) =>{
    var unzip = new window.adm_zip(unpackPath + response.headers['content-disposition'].split('=')[1])
    unzip.extractAllTo(appPath, true)
    window.fs.unlinkSync(unpackPath + response.headers['content-disposition'].split('=')[1]);
    resolve("success")
}

export { download, appPath, unpackPath }