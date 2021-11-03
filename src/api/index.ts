import Mysti from "@Mysti";
import * as http from "http";
import * as https from "https";
import * as fs from 'fs-extra';
import { apiIP, apiOptions, apiPort, apiSecure, apiURL, errorsDir } from "@config";
import express from 'express';
import Logger from "@util/Logger";

export default class API {
  static server: http.Server | https.Server | null = null;
  static app: express.Express;
  static async launch(client: Mysti) {
    this.app = express()
      .set("trust-proxy", true)
      .use("/errors/:id", async(req, res) => {
        if (!fs.existsSync(`${errorsDir}/${req.params.id}`)) return res.status(404).end("No Such File");
        else return res.status(200).header("Content-Type", "text/plain").sendFile(`${errorsDir}/${req.params.id}`);
      })
      .use(express.json())
			.use(express.urlencoded({ extended: true }));
    
    (apiSecure ? https : http).createServer(apiOptions, this.app).listen(apiPort, apiIP);
    Logger.getLogger("API").info(`Now Listening on ${apiURL} (${apiIP}:${apiPort})`);
  }
}