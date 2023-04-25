import { Sequelize } from "sequelize";
import { SequelizeConfigHost } from "./Config";

export const sequelizeHost: Sequelize = new Sequelize(SequelizeConfigHost);

export async function authenticateHost() {
    return await sequelizeHost.authenticate();
}
