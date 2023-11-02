import express from "express";
import { accessControl } from "../../middlewares/xacml";
import { login } from "../../services/Auth";
import { loginSchemaValidation } from "./validations";

const router = express.Router();

router.post("/login", accessControl({ validation: loginSchemaValidation }), login);

export default router;
