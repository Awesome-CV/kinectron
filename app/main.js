"use strict";

const electron = require("electron");
const { app, BrowserWindow } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != "darwin") {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", function() {
  // Get width and height of primary display
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true
    }
  });

  //Use for testing
  //mainWindow = new BrowserWindow({width:1200, height:800});

  // for https

  // SSL/TSL: this is the self signed certificate support
  app.on(
    "certificate-error",
    (event, webContents, url, error, certificate, callback) => {
      // On certificate error we disable default behaviour (stop loading the page)
      // and we then say "it is all fine - true" to the callback
      event.preventDefault();
      callback(true);
    }
  );

  // app.commandLine.appendSwitch("ignore-certificate-errors", "true");
  // app.commandLine.appendSwitch("allow-insecure-localhost", "true");

  // and load the index.html of the app.
  mainWindow.loadURL("file://" + __dirname + "/index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
