import icon from "../../resources/icon.png?asset";
import { ipcHandler } from "./handlers/_handlers";
import { join } from "path";
import { initServer } from "@ongaku/server";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { app, shell, BrowserWindow } from "electron";
import { checkFolders } from "./helpers/check-folders";

initServer();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    title: "Ongaku",
    width: 900,
    height: 670,
    show: false,
    center: true,
    autoHideMenuBar: true,
    backgroundMaterial: "acrylic",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  checkFolders();
  ipcHandler();

  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
