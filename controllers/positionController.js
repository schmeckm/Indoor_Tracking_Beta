const dbBeacon = require('../models/dbBeacon');
const axios = require('axios');
const logger = require('../log/loginfos');

exports.getPosition = async (req, res) => {
  try {
    const beacons = await dbBeacon.find();

    for (const beacon of beacons) {
      const beaconMac = beacon.beaconMac.toLowerCase();

      try {
        const apiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}/context/device/${beaconMac}/2`);
        const deviceData = apiResponse.data.devices[`${beaconMac}/2`];

        if (deviceData && deviceData.raddec && deviceData.raddec.rssiSignature && deviceData.raddec.rssiSignature.length > 0) {
          const highestRssiGateway = deviceData.raddec.rssiSignature.reduce((maxRssi, signature) => {
            if (signature.rssi > maxRssi.rssi) {
              return signature;
            } else {
              return maxRssi;
            }
          });

          beacon.nearestGatewayData = {
            Gateway: highestRssiGateway.receiverId.toUpperCase(),
            receiverIdType: highestRssiGateway.receiverIdType,
            rssi: highestRssiGateway.rssi,
            numberOfDecodings: highestRssiGateway.numberOfDecodings
          };

          try {
            const gatewayApiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}:${process.env.PORT}/api/gateway/getSingleGatewayByMAC/${highestRssiGateway.receiverId.toUpperCase()}`);
            const gatewayData = gatewayApiResponse.data.data;

            if (gatewayData.latitude && gatewayData.longitude) {
              beacon.nearestGatewayData.latitude = gatewayData.latitude;
              beacon.nearestGatewayData.longitude = gatewayData.longitude;
              beacon.nearestGatewayData.saplocation = gatewayData.sapLocation;
            }
          } catch (error) {
            logger.error(`Error while calling the additional API for Gatewaydata to enrich beacon data ${highestRssiGateway.receiverId.toUpperCase()}: ${error.message}`);
          }
        } else {
          logger.error(`Missing data for Beacon ${beaconMac}: deviceData or deviceData.raddec or deviceData.raddec.rssiSignature is undefined.`);
        }

        if (deviceData && deviceData.dynamb) {
          const dynambData = deviceData.dynamb;
          beacon.dynamb = {
            timestamp: dynambData.timestamp,
            batteryPercentage: dynambData.batteryPercentage,
            batteryVoltage: dynambData.batteryVoltage,
            temperature: dynambData.temperature,
            txCount: dynambData.txCount,
            uptime: dynambData.uptime
          };
        }

        if (deviceData && deviceData.statid) {
          const statidData = deviceData.statid;
          beacon.name = statidData.name;
          beacon.uri = statidData.uri;
        }
      } catch (error) {
        logger.error(`Error while calling the API for Beacon ${beaconMac}: ${error.message}`);
      }

      try {
        const secondApiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}/context/device/${beaconMac}/2`);
        const secondApiData = secondApiResponse.data;
        const deviceId = `${beaconMac}/2`;

        if (secondApiData?.devices[deviceId]) {
          const nearestData = secondApiData.devices[deviceId].nearest;

          if (Array.isArray(nearestData)) {
            beacon.nearest = nearestData.map(nearest => ({
              device: nearest.device,
              rssi: nearest.rssi
            }));
          } else {
            logger.error(`Invalid format for the "nearest" field in the second API for Beacon ${beaconMac}`);
          }
        }
      } catch (error) {
        logger.error(`Error while calling the additional API for Beacon ${beaconMac}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        beacons: beacons.map(({ _id, description, beaconMac, __v, nearestGatewayData, dynamb, name, uri, nearest }) => ({
          _id,
          description,
          beaconMac,
          __v,
          nearestGatewayData,
          dynamb,
          name,
          uri
        }))
      }
    });
  } catch (error) {
    logger.error(`Error while retrieving beacons and additional data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Error while retrieving beacons and additional data.'
    });
  }
};