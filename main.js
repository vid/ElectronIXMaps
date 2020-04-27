/* global __dirname, process */
const sudo = require('sudo-prompt');

const { BrowserWindow, Menu, app, shell } = require('electron');
const isDev = require('electron-is-dev');
// const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const URL = require('url');
// const config = require('./app/features/config');

// We need this because of https://github.com/electron/electron/issues/18214
app.commandLine.appendSwitch('disable-site-isolation-trials');

let mainWindow = null;

/**
 * Sets the application menu. It is hidden on all platforms except macOS because
 * otherwise copy and paste functionality is not available.
 */
function setApplicationMenu() {
    if (process.platform === 'darwin' || true) {
        const template = [{
            label: app.name,
            submenu: [{
                label: 'Quit',
                accelerator: 'Command+Q',
                click() {
                    app.quit();
                }
            }]
        }, {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                selector: 'redo:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                selector: 'copy:'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                selector: 'paste:'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                selector: 'selectAll:'
            }
            ]
        }];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }
}


function createIXMapsWindow() {
    // Application menu.
    setApplicationMenu();

    // Check for Updates.
    // autoUpdater.checkForUpdatesAndNotify();

    // Load the previous window state with fallback to defaults.
    const windowState = windowStateKeeper({
        defaultWidth: 1024,
        defaultHeight: 768
    });

    // Path to root directory.
    const basePath = isDev ? __dirname : app.getAppPath();

    // URL for index.html which will be our entry point.
    const indexURL = URL.format({
        pathname: path.resolve(basePath, './build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    const options = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        icon: path.resolve(basePath, './resources/icons/icon_512x512.png'),
        minWidth: 800,
        minHeight: 600,
        show: true,
        webPreferences: {
            nativeWindowOpen: true,
            nodeIntegration: true,
            preload: path.resolve(basePath, './build/preload.js')
        }
    };

    mainWindow = new BrowserWindow(options);
    mainWindow.webContents.openDevTools()

    windowState.manage(mainWindow);
    mainWindow.loadURL(indexURL);

    mainWindow.webContents.on('new-window', (event, url, frameName) => {
        // const target = getPopupTarget(url, frameName);

        // if (!target || target === 'browser') {
        //     event.preventDefault();
        //     shell.openExternal(url);
        // }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

/**
 * Force Single Instance Application.
 */
const gotInstanceLock = app.requestSingleInstanceLock();

if (!gotInstanceLock) {
    app.quit();
    process.exit(0);
}

/**
 * Run the application.
 */

createSudo();
app.on('activate', () => {
    if (mainWindow === null) {
        createIXMapsWindow();
    }
});

app.on('certificate-error',
    // eslint-disable-next-line max-params
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);

app.whenReady().then(createIXMapsWindow);

app.on('second-instance', () => {
    /**
     * If someone creates second instance of the application, set focus on
     * existing window.
     */
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore();
        mainWindow.focus();
    }
});

app.on('window-all-closed', () => {
    // Don't quit the application on macOS.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



export function createSudo() {
    const where = process.resourcesPath;
    console.log(where)
    var options = {
        name: 'IXMaps',
        // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
    };
    sudo.exec(`${where}/platform-trace/ixmaps-trace-linux & `, options,
        function (error, stdout, stderr) {
            if (error) throw error;
            console.log('stdout: ' + stdout);
        }
    );
    console.log('ran sudo');
}

