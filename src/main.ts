import { Client, ClientOptions } from "eris";
import { performance } from "perf_hooks";
import * as fs from 'fs-extra';
import { eventsDir } from "@config";
import { fstat } from "fs";
import Logger from "@util/Logger";
import { Strings, Utility } from "@uwu-codes/utils";
import ClientEvent from "@util/ClientEvents";
export default class Mysti extends Client {
  events = new Map<string, ClientEvent>();

  constructor (token: string, options: ClientOptions) {
    super(token, options);
  }

  async launch() {
    this.checkDirs();
    await this.loadEvents();
		await this.connect();
	}

  checkDirs() {
    [
      "mainLogsDir",
      "errorsDir",
      "eventsDir",
    ].forEach(f => fs.mkdirpSync(f));
  }

  async loadEvents() {
    const start = performance.now();
    if (!fs.existsSync(eventsDir)) throw new Error(`Events dir '${eventsDir}' doesn't exist`)
    const list = await fs.readdir(eventsDir).then(files => files.filter(file => fs.lstatSync(`${eventsDir}/${file}`).isFile()).map(file => `${eventsDir}/${file}`));
    Logger.getLogger('EventLoader').debug(`Found ${list.length} ${Strings.plural("Event", list)}`);
    for (const file of list) {
      const loadStart = performance.now();
      let event = await import(file) as ClientEvent | { default: ClientEvent; };
      if ("default" in event) event = event.default;
      if (!Utility.isOfType(event, ClientEvent)) throw new TypeError(`Export of event '${file}' is not an instance of ClientEvent.`);
      this.events.set(event.name, event);
      this.on(event.name, event.listener.bind(this));
      const loadEnd = performance.now();
      Logger.getLogger("EventLoader").debug(`Loaded the ${event.name} event in ${(loadEnd - loadStart).toFixed(3)}ms`);
    }
    const end = performance.now();
		Logger.getLogger("EventLoader").debug(`Loaded ${list.length} ${Strings.plural("event", list)} in ${(end - start).toFixed(3)}ms`);
  }
}