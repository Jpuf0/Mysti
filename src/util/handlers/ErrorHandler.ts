import { beta, errorsDir } from "@config";
import Logger from "@util/Logger";
import { randomBytes } from "crypto";
import * as fs from 'fs-extra';
import os from 'os';
export default class ErrorHandler {
  static getId() { return randomBytes(6).toString('hex'); }
  private static errorCache = [] as Array<string>;
  static async handleError(err: Error, from: string) {
    if (!err.stack) return null;
    const stackPart = err.stack.split('\n').slice(0, 1).join('\n');
    if (this.errorCache.map(e => e.toLowerCase()).includes(stackPart.toLowerCase())) {
			Logger.getLogger("ErrorHandler").error("Duplicate error stack reported, error:", err);
			return null;
		}

    const id = this.getId();
    const code = `err.${beta ? 'beta' : 'prod'}.${id}`;
    fs.mkdirpSync(errorsDir);
    fs.writeFileSync(`${errorsDir}/${id}`, [
			"-- Host Info --",
			`Mode: ${beta ? "BETA" : "PROD"}`,
			`Server Hostname: ${os.hostname()}`,
			`CWD: ${process.cwd()}`,
			`PID: ${process.pid}`,
			`Node Version: ${process.version}`,
			"",
			"-- Info --",
      `Source: ${from}`,
			`ID: ${id}`,
			`Code: ${code}`,
			"",
			"-- Error -- ",
			err.stack ?? "[No Stack]"
		].join("\n"));


		Logger.getLogger("ErrorHandler").error(`Error Code: ${code}, Stack:`);
		console.error("Error", err);

    //TODO: Webhook

    return code;
  }
}