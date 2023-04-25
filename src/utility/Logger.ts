import moment from "moment";
import * as fs from "fs";
import path from "path";

export enum LogLevels {
    LOG_DEFAULT = "\x1b[37m",
    LOG_INFO = "\x1b[36m",
    LOG_SUCCESS = "\x1b[32m",
    LOG_WARN = "\x1b[33m",
    LOG_ERROR = "\x1b[31m",
}

const reset_string = "\x1b[0m";

function log(logLevel: LogLevels = LogLevels.LOG_DEFAULT, message: string, showDate: boolean = false, customPre: string | null = null) {
    if (customPre == null) {
        console.log(logLevel + (showDate ? `[ ${moment().format("DD.MM.YYYY HH:mm:ss")} ] ` : "") + message + reset_string);
    } else {
        console.log(logLevel + `[ ${customPre} ] ` + message + reset_string);
    }
}

async function logToFile(message: string | undefined, fileName: string = "error.log") {
    const pre = `==================================== ${moment().format("DD.MM.YYYY HH:mm:ss")} ====================================\n`;

    await fs.writeFileSync("log/" + fileName, message ? pre + message + pre + "\n\n" : "", { flag: "a+" });
}

async function clearLogEntries() {
    const directory = "log";

    await fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.writeFile(path.resolve(directory, file), "", { flag: "w+" }, err => {
                if (err) throw err;
            });
        }
    });
}

export default {
    log,
    logToFile,
    clearLogEntries,
};
