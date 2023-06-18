const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const dbConn = require('../config/dbConfig');
const routesConfig = require('../routes/routesConfig');

const PORT = process.env.PORT || 3002;

// Connect to the database
dbConn();

class ParetoAnywhere {
  constructor(options = { useCors: true }) {
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);
    this.configureExpressMiddleware(options);
    this.initialiseServer();
  }

  configureExpressMiddleware(options) {
    this.expressApp.use(express.json());
    this.expressApp.use((req, res, next) => {
      req.pa = this;
      next();
    });

    // Use route modules
    routesConfig.forEach((route) => {
      this.expressApp.use(route.path, route.router);
    });

    if (options && options.useCors) {
      this.expressApp.use(cors({
        origin: '*', // Hier kannst du die erlaubten Ursprünge angeben
        methods: 'GET,PUT,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
      }));
    }
  }

  initialiseServer() {
    const handleServerError = (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Is another middleware instance running?`);
      }
    };

    const handleServerListen = () => {
      console.log(`Middleware is running on port ${PORT}`);
    };

    this.httpServer.on('error', handleServerError);
    this.httpServer.listen(PORT, handleServerListen);
  }
}

// Create an instance of the middleware class
const paretoAnywhere = new ParetoAnywhere();

module.exports = ParetoAnywhere;