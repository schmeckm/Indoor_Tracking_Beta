const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const path = require("path");
const { fetchDataAndSend } = require("./dataFetcher");

// Load environment configurations
dotenv.config({ path: path.resolve(__dirname, "../config.env") });


// Database connection setup
const dbConn = require("../config/dbConfig");
// HTTP route configurations
const routesConfig = require("../routes/routesConfig");


// Default server port and CORS settings
const PORT = process.env.PORT || 3002;
const SOCKETIO_CORS_OPTIONS = {
    cors: { origin: "*", methods: ["GET", "POST"] },
};

// Establish database connection
dbConn();

class trackinglogic {
    constructor(options = {}) {
        // Initializing Express app and server
        this.app = express();
        this.server = http.createServer(this.app);
        this.router = express.Router();
        // Set up Socket.io with the server
        this.io = createSocketIO(this.server, options);

        // Middleware and server initializations
        initialiseExpressMiddleware(this.app, this.router, this, options);
        initialiseServer(this.server, options);

        // Periodically fetch and send data using Socket.io
        setInterval(() => {
            fetchDataAndSend(this.io);
        }, process.env.PullTime);
    }
}

// Set up Express middleware: JSON parser, CORS, and routes
function initialiseExpressMiddleware(app, router, instance, options) {
    app.use(express.json()); // Enable JSON body parsing
    const corsOptions = {
        origin: true,
        credentials: true,
    };
    app.use(cors(corsOptions)); // Set CORS policy
    app.use(function (req, res, next) {
        req.pa = instance; // Attach instance to request for later use
        next();
    });
    // Register routes from the configuration
    routesConfig.forEach((route) => {
        app.use(route.path, route.router);
    });
}

// Create and configure Socket.io instance
function createSocketIO(server, options) {
    let socketOptions = SOCKETIO_CORS_OPTIONS;
    if (options.useCors === false) {
        socketOptions = {}; // If CORS is not required, reset options
    }
    return socketio(server, socketOptions);
}

// Initialize and start the server
function initialiseServer(server, options) {
    server.on("error", function (error) {
        if (error.code === "EADDRINUSE") {
            console.log(
                "Port",
                PORT,
                "is already in use. Is another Trackinglogic instance running?"
            );
        }
    });
    server.listen(PORT, function () {
        console.log("Trackinglogic is running on port", PORT);
    });
}

module.exports = trackinglogic;
