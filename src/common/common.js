
/**
 * 判断当前是否是electron环境
 */
function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}
/**
 * 判断系统版本
 */
const judgeOS = () =>{
    var agent = navigator.userAgent.toLowerCase();
    var isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
        return {name: 'win', code: 32}
    }
    if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
        return {name: 'win', code: 64}
    }
    if(isMac){
        return {name: 'mac', code: 64}
    }
}

export{
    isElectron,
    judgeOS
} 