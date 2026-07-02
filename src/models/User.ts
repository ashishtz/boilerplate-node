import type { Pojo } from "objection";
import BaseModel from "./BaseModel";
import type { Role, UserStatus } from "../constants";

class User extends BaseModel {
	static override tableName = "users";

	id!: number;
	name!: string;
	email!: string;
	password!: string;
	phone!: string;
	status!: UserStatus;
	role!: Role;
	createdAt!: string;
	updatedAt!: string;

	/** The password hash must never leave the API, no matter who serializes the model. */
	override $formatJson(json: Pojo): Pojo {
		const formatted = super.$formatJson(json);
		delete formatted.password;
		return formatted;
	}
}

/** Shape of the authenticated user attached to `req.user`. */
export type AuthUser = Pick<User, "id" | "role" | "email" | "status">;

export default User;
