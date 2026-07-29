const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'frontend/img/logo-app.png'),
    title: 'FIT IA',
    show: false
  });

  mainWindow.loadURL('https://fictia.up.railway.app');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  crearVentana();
});

app.on('window-all-closed', () => {
  app.quit();
});