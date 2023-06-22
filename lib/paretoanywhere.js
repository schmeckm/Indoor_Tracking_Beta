const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const socketio = require("socket.io");

dotenv.config({ path: ".env" });

const dbConn = require("../config/dbConfig");
const routesConfig = require("../routes/routesConfig");

const PORT = process.env.PORT || 3002;
const DEFAULT_USE_CORS = true;

const SOCKETIO_CORS_OPTIONS = {
	cors: { origin: "*", methods: ["GET", "POST"] },
};

// Connect to the database
dbConn();

class ParetoAnywhere {
	constructor(options) {
		let self = this;
		options = options || {};

		this.app = express();
		this.server = http.createServer(self.app);
		this.router = express.Router();

		initialiseExpressMiddleware(self.app, self.router, self, options);
		initialiseServer(self.server, options);
	}
}

/**
 * Initialise the middleware for the given Express instance.
 * @param {Express} app The Express instance.
 * @param {Router} router The Express router.
 * @param {ParetoAnywhere} instance The Pareto Anywhere instance.
 * @param {Object} options The configuration options.
 */
function initialiseExpressMiddleware(app, router, instance, options) {
	app.use(express.json());
	const corsOptions = {
		origin: true, //included origin as true
		credentials: true, //included credentials as true
	};

	app.use(cors(corsOptions));
	app.use(function (req, res, next) {
		req.pa = instance;
		next();
	});

	// Use route modules
	routesConfig.forEach((route) => {
		app.use(route.path, route.router);
	});

	// if (!options.hasOwnProperty('useCors')) {
	//   options.useCors = DEFAULT_USE_CORS;
	// }
	// if (options.useCors) {
	//   console.log("Cors gestartet");
	//   app.use(cors({origin:true}));
	//   // app.use(function(req, res, next) {
	//   //   res.header("Access-Control-Allow-Origin", "*");
	//   //   res.header("Access-Control-Allow-Methods", "GET, POST");
	//   //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	//   //   next();
	//   // });
	// }
}

/**
 * Create the socket.io server.
 * @param {Server} server The server instance.
 * @param {Object} options The configuration options.
 */
function createSocketIO(server, options) {
	let socketOptions = {};

	if (!options.hasOwnProperty("useCors")) {
		options.useCors = DEFAULT_USE_CORS;
		console.log(DEFAULT_USE_CORS);
	}
	if (options.useCors) {
		socketOptions = SOCKETIO_CORS_OPTIONS;
		console.log(SOCKETIO_CORS_OPTIONS);
	}

	return socketio(server, socketOptions);
}

function initialiseServer(server, options) {
	server.on("error", function (error) {
		if (error.code === "EADDRINUSE") {
			console.log("Port", PORT, "is already in use. Is another Pareto Anywhere instance running?");
		}
	});

	server.listen(PORT, function () {
		console.log("Pareto Anywhere by reelyActive is running on port", PORT);
	});
}

module.exports = ParetoAnywhere;