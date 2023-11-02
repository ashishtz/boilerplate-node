import { Model } from "objection";
import BaseModel from "./BaseModel";

class User extends BaseModel {
	static get tableName() {
		return "users";
	}

	id!: number;
	name!: string;
	email!: string;
	password!: string;
	phone!: string;
	status!: "active" | "inactive" | "unverified";
	role!: "admin" | "hr" | "interviewer";
	createdAt!: string;
	updatedAt!: string;
}

export default User;
