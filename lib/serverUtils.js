const express = require("express"); // Importieren von Express
const socketio = require("socket.io");
const cors = require("cors");
const routesConfig = require("../routes/routesConfig");
const PORT = process.env.PORT || 3002;

const SOCKETIO_CORS_OPTIONS = {
  cors: { origin: "*", methods: ["GET", "POST"] },
};

function initialiseExpressMiddleware(app, router, instance, options) {
  app.use(express.json()); // Verwenden von express.json() Middleware
  const corsOptions = {
    origin: true,
    credentials: true,
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
}

function createSocketIO(server, options) {
  let socketOptions = SOCKETIO_CORS_OPTIONS;

  if (options.useCors === false) {
    socketOptions = {};
  }

  return socketio(server, socketOptions);
}

function initialiseServer(server, options) {
  server.on("error", function (error) {
    if (error.code === "EADDRINUSE") {
      console.log(
        "Port",
        PORT,
        "is already in use. Is another Pareto Anywhere instance running?"
      );
    }
  });

  server.listen(PORT, function () {
    console.log("WebServer", PORT);
  });
}

module.exports = { initialiseExpressMiddleware, createSocketIO, initialiseServer };
