require("dotenv").config();
module.exports = {
	client : "mysql",
	migrations : { stub: "./templates/migration.js" },
	connection : {
		host : process.env.DATABASE_HOST,
		port : process.env.DATABASE_PORT || 3306,
		user : process.env.DATABASE_USERNAME,
		password : process.env.DATABASE_PASSWORD,
		database : process.env.DATABASE_NAME,
	},
};
