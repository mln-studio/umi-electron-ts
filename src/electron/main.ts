import { app, BrowserWindow } from 'electron';
import createProtocol from './createProtocol';

const isDev = process.env.NODE_ENV === 'development';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:8000');
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
