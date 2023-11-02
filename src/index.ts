import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import { app as appSettings } from "./config";
import log from "./providers/log";
import responseExtended from "./middlewares/response";
import userDetail from "./middlewares/userDetail";
import api from "./routes";

dotenv.config();

const corsOptions: CorsOptions = {
	origin : (origin, callback) => {
		if (!(appSettings.allowedHosts || []).length || (appSettings.allowedHosts || []).includes(origin!) || !origin) {
			callback(null, origin);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials : true,
};

const app: Express = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

// Custom Middlewares
app.use(responseExtended);
app.use(userDetail);

const port = process.env.PORT || 4200;
app.use("/api", api);

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

app.listen(port, () => {
	log.info(`⚡️ Server is running at port:${port}`);
});
