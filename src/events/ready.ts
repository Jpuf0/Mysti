import ClientEvent from "@util/ClientEvent";
import Logger from "@util/Logger";
import API from "../api";

export default new ClientEvent("ready", async function() {
  Logger.info(`Ready as ${this.user.username}#${this.user.discriminator}`);
  await API.launch(this);
} )