const fs = require("fs");

/*
	USE_PROXY: for vexcess - set to true for production, set to false for development
	MASTER_KEY: the encryption key used to encrypt profiles and stuff
	RECAPTCHA_KEY: the key for validating the Google Recaptcha on the sign up page; you must aquire your own key from Google
	KEY: the SSL key used for HTTPS encryption. You don't need this if you change the code to use a plain HTTP server instead
	CERT: the SSL certificate used for HTTPS encryption. You don't need this if you change the code to use a plain HTTP server instead
	PORT: integer specifying which port to open the server on
	SANDBOX_PORT: integer specifying which port to open the sandbox server on
	COMPILER_PORT: integer specifying which port to open the compiler server on
	MONGO_IP: the IP address of the database
	MONGO_PORT: integer specifying which port the database is running on
	MONGO_PASSWORD: password for MongoDB authentication. Not required if MongoDB authentication is not configured
*/

module.exports = {
	getSecrets(programRoot) {
		return {
			USE_PROXY: false,
			MASTER_KEY: "PASSWORD1",
			RECAPTCHA_KEY: "PASSWORD2",
			KEY: fs.readFileSync(programRoot + "server.key"),
			CERT: fs.readFileSync(programRoot + "server.cert"),
			PORT: 3000,
			SANDBOX_PORT: 3001,
			COMPILER_PORT: 3002,
			MONGO_PORT: 27017,
			MONGO_IP: "localhost",
			MONGO_PASSWORD: "PASSWORD3"
		};
	}
};
