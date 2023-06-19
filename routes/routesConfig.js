// routesConfig.js
const beaconRouter = require('../routes/dbBeaconRoutes');
const gatewayRouter = require('../routes/gatewayRoutes');
const environmentRouter = require('../routes/environmentRoutes');
const positionRouter = require('../routes/PostionRoutes');
const zoneRouter = require('../routes/zoneRoutes');

const routes = [
  { path: '/api/beacon', router: beaconRouter },
  { path: '/api/gateway', router: gatewayRouter },
  { path: '/api/environment', router: environmentRouter },
  { path: '/api/position', router: positionRouter },
  { path: '/api/zone', router: zoneRouter },
];

module.exports = routes;