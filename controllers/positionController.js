const dbBeacon = require('../models/dbBeacon');
const axios = require('axios');

exports.getPosition = async (req, res) => {
  try {
    const beacons = await dbBeacon.find();

    // Iterating over the beacons
    for (const beacon of beacons) {
      const beaconMac = beacon.beaconMac.toLowerCase();

      try {
    
        const apiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}/context/device/${beaconMac}/2`); // Verwenden Sie die Umgebungsvariable in der API-Anfrage
        const deviceData = apiResponse.data.devices[`${beaconMac}/2`];
        console.log(deviceData);

        if (deviceData) {
          if (deviceData.raddec.rssiSignature && deviceData.raddec.rssiSignature.length > 0) {
            // Find gateway with highest RSSI
            const highestRssiGateway = deviceData.raddec.rssiSignature.reduce((maxRssi, signature) => {
              if (signature.rssi > maxRssi.rssi) {
                return signature;
              } else {
                return maxRssi;
              }
            });

            // Create nearestGatewayData object with highest RSSI gateway
            beacon.nearestGatewayData = {
              Gateway: highestRssiGateway.receiverId.toUpperCase(),
              receiverIdType: highestRssiGateway.receiverIdType,
              rssi: highestRssiGateway.rssi,
              numberOfDecodings: highestRssiGateway.numberOfDecodings
            };

            try {
              console.log(highestRssiGateway.receiverId);

              const gatewayApiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}:${process.env.PORT}/api/gateway/getSingleGatewayByMAC/${highestRssiGateway.receiverId.toUpperCase()}`);
              const gatewayData = gatewayApiResponse.data.data;
              console.log(gatewayData);
              if (gatewayData.latitude && gatewayData.longitude) {
                beacon.nearestGatewayData.latitude = gatewayData.latitude;
                beacon.nearestGatewayData.longitude = gatewayData.longitude;
                beacon.nearestGatewayData.saplocation = gatewayData.sapLocation;
              }
            } catch (error) {
              console.error(`Error while calling the additional API for Gatewaydata ${highestRssiGateway.receiverId.toUpperCase()}: ${error.message}`);
            }
          }

          if (deviceData.dynamb) {
            // Extracting dynamb data from deviceData
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

          if (deviceData.statid) {
            // Extracting statid data from deviceData
            const statidData = deviceData.statid;
            beacon.name = statidData.name;
            beacon.uri = statidData.uri;
          }
        }
      } catch (error) {
        console.error(`Error while calling the API for Beacon ${beaconMac}: ${error.message}`);
      }

      try {
        const secondApiResponse = await axios.get(`${process.env.PARETOANYWHERE_URL}/context/device/${beaconMac}/2`);
        const secondApiData = secondApiResponse.data;
        const deviceId = `${beaconMac}/2`;

        if (secondApiData?.devices[deviceId]) {
          const nearestData = secondApiData.devices[deviceId].nearest;

          if (Array.isArray(nearestData)) {
            // Extracting nearest data from secondApiData
            beacon.nearest = nearestData.map(nearest => ({
              device: nearest.device,
              rssi: nearest.rssi
            }));
          } else {
            console.error(`Invalid format for the "nearest" field in the second API for Beacon ${beaconMac}`);
          }
        }
      } catch (error) {
        console.error(`Error while calling the additional API for Beacon ${beaconMac}: ${error.message}`);
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
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Error while retrieving beacons and additional data.'
    });
  }
};