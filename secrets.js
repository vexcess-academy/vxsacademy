const fs = require("fs");

module.exports = {
	MASTER_KEY: "abc123",
  	RECAPTCHA_KEY: "abc123",
	KEY: fs.readFileSync("../server.key"),
	CERT: fs.readFileSync("../server.cert"),
	PORT: 3000,
	SANDBOX_PORT: 3001,
	MONGO_IP: "localhost",
	MONGO_PORT: "27017"
};

