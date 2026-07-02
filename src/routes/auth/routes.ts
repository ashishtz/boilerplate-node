import { Router } from "express";
import rateLimit from "express-rate-limit";
import { appConfig } from "../../config";
import { accessControl } from "../../middlewares/xacml";
import { login, register } from "../../services/auth";
import { registerAccessControl } from "./accessControls";
import { loginValidation, registerValidation } from "./validations";

const router = Router();

// Credential endpoints get a much stricter budget than the rest of the
// API to slow down brute force and credential stuffing attempts.
const authLimiter = rateLimit({
	windowMs: appConfig.rateLimit.windowMs,
	limit: appConfig.rateLimit.authMax,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_req, res) => res.withError("TOO_MANY_REQUESTS", 429),
});

router.post("/login", authLimiter, accessControl({ validation: loginValidation }), login);
router.post(
	"/register",
	authLimiter,
	accessControl({ validation: registerValidation, ...registerAccessControl }),
	register,
);

export default router;
