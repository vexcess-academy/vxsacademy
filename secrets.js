const fs = require("fs");

module.exports = {
	"MASTER_KEY": "1234",
  	"RECAPTCHA_KEY": "1234",
	key: fs.readFileSync("../server.key"),
	cert: fs.readFileSync("../server.cert"),
	port: 1234,
	sandboxPort: 1234,
	databaseURL: "mongodb://localhost:1234"
};
