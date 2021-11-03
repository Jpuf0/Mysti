import "./util/MonkeyPatch";
import { beta, clientInfo, clientOptions, isPterodactyl, isWSL, wslVersion } from "./config";
import ErrorHandler from "@util/handlers/ErrorHandler";
import Logger from "@util/Logger";
import Mysti from "./main";
import { Time } from "@uwu-codes/utils";

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
void bot.getBotGateway().then(function preLaunchInfo({ session_start_limit: { remaining, total, reset_after }, shards }) {
	Logger.getLogger("Launch").info(`Mode: ${beta ? "BETA" : "PROD"} | CWD: ${process.cwd()} | PID: ${process.pid}`);
	Logger.getLogger("Launch").info(`Session Limits: ${remaining}/${total} - Reset: ${Time.dateToReadable(new Date(Date.now() + reset_after)).slice(0, 10)} ${Time.dateToReadable(new Date(Date.now() + reset_after)).slice(10, 18)} | Recommended Shards: ${shards}`);
	Logger.getLogger("Launch").info("Node Version:", process.version);
	Logger.getLogger("Launch").info(`Platform: ${process.platform} (Manager: ${isWSL ? `WSLv${wslVersion}` : isPterodactyl ? "Pterodactyl" : "None"})`);
	return bot.launch();
});
