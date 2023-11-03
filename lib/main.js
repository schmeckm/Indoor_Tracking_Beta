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
const CORS_OPTIONS = {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true, // Include credentials in the CORS requests
};

// Establish database connection
dbConn();

class TrackingLogic {
    constructor(options = {}) {
        // Initializing Express app and server
        this.app = express();
        this.server = http.createServer(this.app);

        // Apply CORS middleware to the Express app for all routes
        this.app.use(cors(CORS_OPTIONS));

        // Set up Socket.io with the server using the same CORS options
        this.io = socketio(this.server, {
            cors: CORS_OPTIONS
        });

        // Middleware and server initializations
        initialiseExpressMiddleware(this.app, this.router, this, options);
        initialiseServer(this.server, options);

        // Periodically fetch and send data using Socket.io
        setInterval(() => {
            fetchDataAndSend(this.io);
        }, process.env.PullTime);
    }
}

// Set up Express middleware: JSON parser and routes
function initialiseExpressMiddleware(app, router, instance, options) {
    app.use(express.json()); // Enable JSON body parsing

    app.use((req, res, next) => {
        req.pa = instance; // Attach instance to request for later use
        next();
    });

    // Register routes from the configuration
    routesConfig.forEach((route) => {
        app.use(route.path, route.router);
    });
}

// Initialize and start the server
function initialiseServer(server, options) {
    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.log(
                "Port",
                PORT,
                "is already in use. Is another TrackingLogic instance running?"
            );
        }
    });

    server.listen(PORT, () => {
        console.log(`TrackingLogic is running on port ${PORT}`);
    });
}

module.exports = TrackingLogic;