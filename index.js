const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const shell = require("electron").shell;
const { readdir, stat } = require("fs/promises");
const fs = require("fs");
const fastFolderSize = require("fast-folder-size");
const checkDiskSpace = require('check-disk-space').default



// require("electron-reload")(__dirname, {
//     electron: path.join(__dirname, "node_modules", ".bin", "electron"),
//     hardResetMethod: "exit",
// });

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js"),
        },
        resizable: true,
        maximizable: false,
        fullscreenable: false,
        frame: false,
        // disable zooming, defualt zoom 100%
        zoomToPageWidth: false,
    });

    ipcMain.on("get-home-content", (event, arg) => {
        return (event.returnValue = "Hello from the main process!");
    });

    win.loadFile("web/index.html");
};

// api
function handleSetTitle(event, title) {
    return `title: ${title}`;
}

async function getDirectory(event, path) {
    // return a detailed json of the directory
    var directory = {};
    // get the files in the directory
    var files = fs.readdirSync(path);
    // for each file
    for (var i = 0; i < files.length; i++) {
        // get the file
        var file = files[i];
        var full_path = path + "/" + file;
        var stats = fs.stat;
        // fs.lstatSync(path_string).isDirectory()
        // get type of file
        if (fs.lstatSync(full_path).isDirectory()) {
            var type = "directory";
        } else {
            var type = "file";
        }
        // add the file to the directory
        directory[file] = {
            type: type,
            path: full_path,
            name: file,
        };
    }
    // return the directory
    return directory;
}

function getFolderSizeRecur(directory, previous_size) {
    // get the size of the directory recursively
    var total_size = 0;
    // get the files in the directory
    var files = fs.readdirSync(directory);
    // for each file
    for (var i = 0; i < files.length; i++) {
        // get the file
        var file = files[i];
        var full_path = directory + "/" + file;
        // get type of file
        if (fs.lstatSync(full_path).isDirectory()) {
            var type = "directory";
        } else {
            var type = "file";
        }
        // if the file is a directory
        if (type == "directory") {
            // get the size of the directory
            var size = getFolderSizeRecur(full_path, 0);
            // add the size to the total size
            total_size += size;
        } else {
            // get the size of the file
            var size = fs.statSync(full_path).size;
            // add the size to the total size
            total_size += size;
        }
    }
    // return the total size
    return total_size;
}


async function foo(event) {
    event.returnValue = "Hello from the main process!";
    return "Hello from the main process!";
}

// folder browser dialog
async function getDirectoryDialog() {
    const { dialog } = require("electron");
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    return result.filePaths[0];
}

async function getConfig(event) {
    // return json for the config file
    // if config file does not exist, create it
    if (!fs.existsSync("config.json")) {
        // create config file
        fs.writeFileSync("config.json", "{}");
    }
    // read config file
    var config = fs.readFileSync("config.json");
    // parse config file
    config = JSON.parse(config);
    // return config file
    return config;
}

async function setConfig(event, config) {
    // set the config file
    // write config file
    try {
        fs.writeFileSync("config.json", JSON.stringify(config));
    } catch (err) {
        console.log(err);
    }
}


async function indexStorage(event) {
    // get all media directories and index the sizes of each directory
    // also add the total of each directory in possible storage
    var total_mb = 0;
    var directory_data = {};
    var free_space = 0
    // get the config file
    var config = await getConfig(event);
    var media_directories = config.media_locations;

    // for each media directory
    for (var i = 0; i < media_directories.length; i++) {
        // we want to get the size of the directory
        var directory = media_directories[i];

        var size_mb = getFolderSizeRecur(directory, 0) / 1024 / 1024 ;
        total_mb += size_mb;
        directory_data[directory] = size_mb;

        // get free space on the drive using windows api
        var drive = directory.split(":")[0];

    }

    // get the total size of all the drives from each directory
    var drives = []
    for (var i = 0; i < media_directories.length; i++) {
        var drive = media_directories[i].split(":")[0];
        if (!drives.includes(drive)) {
            drives.push(drive);
        }
    }

    // get the free space on each drive
    for (var i = 0; i < drives.length; i++) {
        var drive = drives[i];
        console.log(`[disks] check free space on drive ${drive}`)
        await checkDiskSpace(drive + ":\\").then((diskSpace) => {
            var free_space_mb = diskSpace.free / 1024 / 1024;
            free_space += free_space_mb;
        });
    }
    directory_data["total"] = total_mb;
    directory_data["free_space"] = free_space;
    return directory_data;
}

// exit
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// start
app.whenReady().then(() => {
    ipcMain.on("set-title", handleSetTitle);
    ipcMain.handle("get-directory", getDirectory);
    ipcMain.handle("get-directory-dialog", getDirectoryDialog);
    ipcMain.handle("get-config", getConfig);
    ipcMain.handle("set-config", setConfig);
    ipcMain.handle("foo", foo);
    ipcMain.handle("index-storage", indexStorage);
    createWindow();
});
