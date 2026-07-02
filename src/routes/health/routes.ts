import { Router } from "express";
import { checkDatabaseConnection } from "../../database";

const router = Router();

/** Liveness: the process is up and serving requests. */
router.get("/", (_req, res) => {
	res.withData({ status: "ok", uptime: process.uptime() });
});

/** Readiness: the process can reach its dependencies (database). */
router.get("/ready", async (_req, res) => {
	try {
		await checkDatabaseConnection();
		res.withData({ status: "ready" });
	} catch {
		res.withError("NOT_AVAILABLE", 503);
	}
});

export default router;
