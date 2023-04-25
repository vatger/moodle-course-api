import { Error } from "sequelize";
import Logger, { LogLevels } from "../utility/Logger";
import { Config } from "./Config";
import moment from "moment";
import { authenticateHost } from "./Sequelize";

let non_critical_count = 0;

export const initializeApplication = async () => {
    Logger.log(LogLevels.LOG_INFO, `=================== ${moment().format("DD.MM.YYYY HH:mm:ss")} ================== \nApplication starting...\n`);

    await clearLogFiles();

    await checkDatabaseConnection();

    Logger.log(
        LogLevels.LOG_INFO,
        `\nStartup complete - ${non_critical_count} non-critical check(s) failed. \n==========================================================\n\n`
    );
};

async function clearLogFiles() {
    Logger.log(LogLevels.LOG_INFO, "Clearing previous log files from log/*");
    try {
        await Logger.clearLogEntries();
    } catch (e) {
        Logger.log(LogLevels.LOG_WARN, `\0 \u2A2F Failed to clear log files. Not critical -> continuing\n`);
        non_critical_count++;
        return;
    }
    Logger.log(LogLevels.LOG_SUCCESS, "\0 \u2713 Log files cleared.\n");
}

async function checkDatabaseConnection() {
    Logger.log(LogLevels.LOG_INFO, `Checking Database Connection HOST [${Config.DATABASE_CONFIG_HOST.HOST}:${Config.DATABASE_CONFIG_HOST.PORT}]`);
    try {
        await authenticateHost();
    } catch (e: any) {
        if (e instanceof Error) {
            Logger.log(
                LogLevels.LOG_ERROR,
                `\0 \u2A2F Failed to connect to HOST Database. Error: ${e.name} \n\t To check the stack-trace, navigate to log/sequelize.log`
            );
            await Logger.logToFile(e.stack, "sequelize.log");
        }
        throw e;
    }
    Logger.log(LogLevels.LOG_SUCCESS, "\0 \u2713 HOST Database Connection established.");
}
