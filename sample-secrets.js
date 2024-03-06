const fs = require("fs");

// this is simply a demo secrets.js file

module.exports = {
	getSecrets(programRoot) {
		return {
			USE_PROXY: false,
			MASTER_KEY: "THE_QUICK_BROWN_FOX",
			RECAPTCHA_KEY: "ABC123", // You must aquire your own key from Google
			KEY: fs.readFileSync(programRoot + "server.key"),
			CERT: fs.readFileSync(programRoot + "server.cert"),
			PORT: 3000,
			SANDBOX_PORT: 30001,
			MONGO_IP: "localhost",
			MONGO_PORT: "27017"
		};
	}
};
