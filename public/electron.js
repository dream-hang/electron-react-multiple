// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, Menu, Tray, crashReporter, shell} = require('electron')
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;             // 主窗口
let popupWindow;            // 第二窗口

// 禁用GPU加速
app.disableHardwareAcceleration()
// 主窗口显示
function createWindow() {
    // 创建浏览器窗口,宽高自定义具体大小你开心就好
    mainWindow = new BrowserWindow(
        {
            width: 1200,
            height: 800,
            title: '测试平台',
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true
            }
        }
    )
    tray = new Tray(path.join(__dirname, 'logo192.png'))
    if (process.platform === 'darwin') {
        app.dock.setIcon(path.join(__dirname, 'logo192.png'));
    }
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '展开', click: function () {
                mainWindow.show();
            }
        },
        {
            label: '退出', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('测试')
    tray.on('click', function () {
        mainWindow.show();
    })
    tray.setContextMenu(contextMenu);
    if (isDev) { // 开发环境
        mainWindow.loadURL('http://localhost:4000/');
        // 打开开发者工具
        mainWindow.webContents.openDevTools()
    } else { // 生产环境
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    mainWindow.setMenu(null); // 隐藏状态栏
    // 关闭window时触发下列事件 不关闭应用 将应用最小化
    mainWindow.on('close', function (e) {
        if (!app.isQuiting) {
            e.preventDefault();
            mainWindow.minimize();
            mainWindow.setSkipTaskbar(true);
        }
        return false;
    })
}

// 获取该应用是否成功取得了锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance',(event,commandLine,workingDirectory)=>{
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
                mainWindow.focus();
            }
        }
    })
    // 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
    app.on('ready', createWindow)
}
// 禁止请求缓存
app.commandLine.appendSwitch('--disable-http-cache');
// 开启自动播放
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
    // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', function () {
    // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
    if (mainWindow === null) {
        createWindow()
    }
})
