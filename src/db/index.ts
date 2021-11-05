import { beta, services } from '@config';
import Logger from '@util/Logger';
import Timer from '@util/Timer';
import type { Pool } from 'mariadb';
import mariadb from 'mariadb';

export default class db {
  static pool: Pool;
  static rootPool: Pool;

  static async init(sql = true) {
    const start = Timer.start();
    if (sql) await this.initMariaDb();
		const end = Timer.end();
		Logger.getLogger("DatabaseManager[Init]").debug(`Initialization complete in ${Timer.calc(start, end, 0, false)}`);
  }

  static async initMariaDb() {
    const uri = `mariadb://${services.mariadb.host}:${services.mariadb.port}`;
    Logger.getLogger("DatabaseManager[MariaDB]").debug(`Connecting to ${uri} (ssl: ${services.mariadb.ssl ? "Yes" : "No"})`);
    const start = Timer.start();
    try {
      this.pool = mariadb.createPool({
        ...services.mariadb,
        database: services.mariadb.db[beta ? 'beta' : 'prod'],
      });
      this.rootPool = mariadb.createPool({
        ...services.mariadb,
        database: services.mariadb.db[beta ? "beta" : "prod"],
        user: 'root',
        password: services.mariadb.rootPass,
      });
    } catch (err) {
      Logger.getLogger("DatabaseManager[MariaDB]").error("Error While Connecting", err);
      return;
    }
    const end = Timer.end();
    Logger.getLogger("DatabaseManager[MariaDB]").debug(`Successfully connected in ${Timer.calc(start, end, 0, false)}`);
  }
}