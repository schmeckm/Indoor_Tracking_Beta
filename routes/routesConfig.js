// Import routers for each resource/module.
const beaconRouter = require('./dbBeaconRoutes');         // Router for beacon-related routes
const gatewayRouter = require('./gatewayRoutes');         // Router for gateway-related routes
const environmentRouter = require('./environmentRoutes'); // Router for environment-related routes
const positionRouter = require('./PostionRoutes');        // Router for position-related routes
const temperatureRouter = require('./temperatureRoutes'); // Router for temperature-related routes
const businessObjectRouter = require('./businessObjectRoutes'); // Router for business object-related routes
const settingRouter = require('./systemRoutes'); // Router for business object-related routes

// Define an array of routes with their associated path and router.
// This structure helps in modularly applying routes in the main app.
const routes = [
  { path: '/api/beacon', router: beaconRouter },
  { path: '/api/gateway', router: gatewayRouter },
  { path: '/api/environment', router: environmentRouter },
  { path: '/api/position', router: positionRouter },
  { path: '/api/temperature', router: temperatureRouter },
  { path: '/api/businessobject', router: businessObjectRouter },
  { path: '/api/setting', router: settingRouter },
];

// Export the routes array to be used in the main app.
module.exports = routes;
