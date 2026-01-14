const { app, BrowserWindow, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let pyProcess = null;

// Auto-Update Logs සහ Settings
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    title: "PRISPOINT VCS",
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Backend Start (ඔබේ පැරණි කේතය)
  let backendPath = process.platform === 'win32' 
    ? path.join(__dirname, 'dist', 'app.exe') 
    : path.join(__dirname, 'dist', 'app');

  pyProcess = exec(backendPath, (err) => {
    if (err) console.error("Failed to start backend:", err);
  });

  setTimeout(() => {
    win.loadURL('http://127.0.0.1:5001');
  }, 3000);

  // --- Auto Update පරීක්ෂාව ---
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// Update එකක් ලැබුණු විට පණිවිඩයක් පෙන්වීම
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'අලුත් සංස්කරණයක් තිබේ. එය පසුබිමෙන් බාගත වේ.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'බාගත කිරීම අවසන්. ඇප් එක වැසූ පසු එය ස්වයංක්‍රීයව Update වේ.',
    buttons: ['දැන්ම Install කරන්න', 'පසුව']
  }).then((result) => {
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
});

if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (pyProcess != null) {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${pyProcess.pid} /f /t`);
    } else {
      pyProcess.kill();
    }
  }
  if (process.platform !== 'darwin') app.quit();
});
