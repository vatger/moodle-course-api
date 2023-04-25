import dotenv from "dotenv";
import path from "path";
import { Dialect, Options } from "sequelize";
import Logger, { LogLevels } from "../utility/Logger";

const fp = __dirname + "/../../.env";

dotenv.config({ path: path.resolve(fp) });

console.log(`Loading .env from ${fp}`);

// Validate required environment variables are present before continuing
const required_env: Array<string> = ["APP_PORT", "APP_TOKEN", "DB_DIALECT", "DB_HOST", "DB_PORT", "DB_DATABASE_NAME", "DB_USERNAME", "DB_PASSWORD"];

let env_missing: boolean = false;
required_env.forEach(key => {
    if (process.env[key] == null) {
        Logger.log(LogLevels.LOG_ERROR, `Missing the following .env key [${key}].`);
        env_missing = true;
    }
});
if (env_missing) process.exit(-1);

Logger.log(LogLevels.LOG_SUCCESS, `.env contains all required keys.`);

// If all environment variables are present, we can continue to create the config!
export const Config = {
    APP_DEBUG: process.env.APP_DEBUG?.toLowerCase() == "true",
    APP_LOG_SQL: process.env.APP_LOG_SQL?.toLowerCase() == "true",
    APP_TOKEN: process.env.APP_TOKEN,

    DATABASE_CONFIG_HOST: {
        DIALECT: process.env.DB_DIALECT as Dialect,
        USERNAME: process.env.DB_USERNAME,
        PASSWORD: process.env.DB_PASSWORD,
        DATABASE_NAME: process.env.DB_DATABASE_NAME,
        HOST: process.env.DB_HOST,
        PORT: Number(process.env.DB_PORT),
    },

    APP_PORT: Number(process.env.APP_PORT),
};

export const SequelizeConfigHost: Options = {
    dialect: Config.DATABASE_CONFIG_HOST.DIALECT,
    username: Config.DATABASE_CONFIG_HOST.USERNAME,
    password: Config.DATABASE_CONFIG_HOST.PASSWORD,
    database: Config.DATABASE_CONFIG_HOST.DATABASE_NAME,
    host: Config.DATABASE_CONFIG_HOST.HOST,
    port: Config.DATABASE_CONFIG_HOST.PORT,

    // Define custom logging function for SQL queries
    logging: message => {
        if (!Config.APP_LOG_SQL) return;
        Logger.log(LogLevels.LOG_WARN, message, false, "SQL - HOST");
    },
};
