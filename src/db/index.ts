import { beta, services } from '@config';
import Logger from '@util/Logger';
import Timer from '@util/Timer';
import type { Pool } from 'mariadb';
import mariadb from 'mariadb';
import IORedis from "ioredis";

export interface MariaDBUserStats {
	USER: string;
	TOTAL_CONNECTIONS: number;
	CONCURRENT_CONNECTIONS: number;
	CONNECTED_TIME: number;
	BUSY_TIME: number;
	CPU_TIME: number;
	BYTES_RECEIVED: bigint;
	BYTES_SENT: bigint;
	BINLOG_VYTES_WRITTEN: bigint;
	ROWS_READ: bigint;
	ROWS_SENT: bigint;
	ROWS_INSERTED: bigint;
	ROWS_UPDATED: bigint;
	SELECT_COMMANDS: bigint;
	UPDATE_COMMANDS: bigint;
	OTHER_COMMANDS: bigint;
	COMMIT_TRANSACTIONS: bigint;
	ROLLBACK_TRANSACTIONS: bigint;
	DENIED_CONNECTIONS: bigint;
	LOST_CONNECTIONS: bigint;
	ACCESS_DENIED: bigint;
	EMPTY_QUERIES: bigint;
	TOTAL_SSL_CONNECTIONS: bigint;
	MAX_STATEMENT_TIME_EXCEEDED: bigint;
}

export default class db {
  static redisDb: number;
	static r: IORedis.Redis;
  static pool: Pool;
  static rootPool: Pool;

  static async init(sql = true, redis = true) {
    const start = Timer.start();
    if (sql) await this.initMariaDb();
    if (redis) await this.initRedis();
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

  static async initRedis() {
    return new Promise<void>(resolve => {
      this.redisDb = services.redis[beta ? 'dbBeta' : 'db']
      const start = Timer.start();
      Logger.getLogger('DatabaseManager[Redis]').debug(`Connecting to redis://${services.redis.host}:${services.redis.port} using user "${services.redis.username ?? "default"}", and db ${this.redisDb}`);
      this.r = new IORedis(services.redis.port, services.redis.host, {
        username: services.redis.username,
        password: services.redis.password,
        db: this.redisDb,
        connectionName: `Mysti${beta ? 'Beta' : ''}`
      })

      this.r.on('connect', () => {
        const end = Timer.end();
        Logger.getLogger("Database[Redis]").debug(`Successfully connected in ${Timer.calc(start, end, 0, false)}`);
				resolve();
      })
    })
  }

  static async getStats() {
		return (this.rootQuery("SELECT * FROM INFORMATION_SCHEMA.USER_STATISTICS WHERE USER=?", [services.mariadb.user]) as Promise<[MariaDBUserStats?]>).then(v => v[0]);
	}

  static get query() { return this.pool.query.bind(this.pool); }
	static get rootQuery() { return this.rootPool.query.bind(this.rootPool); }

  static async insert(table: string, data: Record<string, unknown>) {
		const keys = Object.keys(data);
		const values = Object.values(data);
		await this.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${values.map(() => "?").join(", ")})`, values);
	}

}