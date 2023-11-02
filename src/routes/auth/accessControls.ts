import { User } from "../../models";
import { validateJwt } from "../../providers/jwt";
import { constant } from "../../config";
import { Pre, SecondaryValidation } from "../../middlewares/xacml";

interface Data {
	userId: string;
}

const pre: {
	[key: string]: Pre[];
} = {
	addUser : [
		{
			assign : "userByEmail",
			method : (req) => {
				return User.query().where("email", req.body.email).first();
			},
		},
	],
	accountVerfication : [
		{
			assign : "userToken",
			method : (req) => {
				const { params } = req;
				const token = validateJwt(params?.token);
				return token || null;
			},
		},
		{
			assign : "user",
			method : async (req) => {
				const { params } = req;
				let user = <User | undefined>{};
				const data = <Data>validateJwt(params?.token);
				if (!data || !data.userId) return user;
				user = await User.query().findOne("id", data.userId).where("status", constant.userStatusActive);
				return user || null;
			},
		},
	],
};

const secondaryValidation: {
	[key: string]: SecondaryValidation[];
} = {
	addUser : [
		{
			assign : "checkUserExist",
			method : (req) => {
				return !(req?.pre?.userByEmail || []).length;
			},
		},
	],
	accountVerfication : [
		{
			assign : "checkTokenExpiry",
			method : ({ pre: { userToken } }) => {
				return !!userToken;
			},
		},
		{
			assign : "checkUserAlreadyActive",
			method : ({ pre: { user } }) => {
				return !!user;
			},
		},
	],
};

export default {
	pre,
	secondaryValidation,
};
