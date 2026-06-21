import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { getDatabase, closeDatabase } from './database';
import { setupStudentIpc } from './ipc/students';
import { setupLessonIpc } from './ipc/lessons';
import { setupRecordIpc } from './ipc/records';
import { setupHomeworkIpc } from './ipc/homework';
import { setupBillingIpc } from './ipc/billing';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: '#faf8f5',
    title: 'Music Studio Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true,
    titleBarStyle: 'default',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  getDatabase();
  setupStudentIpc();
  setupLessonIpc();
  setupRecordIpc();
  setupHomeworkIpc();
  setupBillingIpc();
  setupFileIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupFileIpc(): void {
  ipcMain.handle('files:selectAudio', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a', 'ogg'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }
      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('files:saveAudio', async (_event, fileName: string, arrayBuffer: ArrayBuffer) => {
    try {
      const userDataPath = app.getPath('userData');
      const audioDir = path.join(userDataPath, 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      return { success: true, data: filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('files:savePdf', async (_event, fileName: string, arrayBuffer: ArrayBuffer) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save cancelled' };
      }
      fs.writeFileSync(result.filePath, Buffer.from(arrayBuffer));
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
