import { clientInfo, clientOptions } from "./config";
import ErrorHandler from "@util/handlers/ErrorHandler";
import Logger from "@util/Logger";
import Mysti from "./main";


process
      .on("uncaughtException", (err) => {
        void ErrorHandler.handleError(err, "Uncaught Exception");
        Logger.getLogger("Uncaught Exception").error(err);
      })
      .on("unhandledRejection", (err, p) => {
        void ErrorHandler.handleError(err as Error, "Unhandled Rejection");
        Logger.getLogger("Unhandled Rejection").error(err, p);
      })
      .on('SIGINT', () => process.kill(process.pid))

const bot = new Mysti(clientInfo.token, clientOptions);
