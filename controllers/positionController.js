// Import the required modules
const dbBeacon = require("../models/dbBeacon"); // Beacon model from the database
const axios = require("axios"); // Library to handle HTTP requests
const logger = require("../log/loginfos"); // Logger for logging

// Function to get device data from the ParetoAnywhere API
async function getDeviceData(beaconMac) {
    console.log(process.env.PARETOANYWHERE_URL);
    try {
        // Make a GET request to the API and store the response
        const apiResponse = await axios.get(
            `${process.env.PARETOANYWHERE_URL}/context/device/${beaconMac}/2`
        );
        console.log("Markus");
        // Return the device data from the response
        return apiResponse.data.devices[`${beaconMac}/2`];
    } catch (error) {
        // Log and throw an error if the API request fails
        logger.error(`Error while calling the API for Beacon ${beaconMac}: ${error.message}`, error);
        throw new Error(`Error while calling the API for Beacon ${beaconMac}: ${error.message}`);
    }
}

// Function to get gateway data from an API
async function getGatewayData(deviceWithLowestRSSI) {
    try {
        // Make a GET request to the API and store the response
        const gatewayApiResponse = await axios.get(
            `${process.env.Backend_URL}/api/gateway/getSingleGatewayByMAC/${deviceWithLowestRSSI.split("/").shift().toUpperCase()}`
        );
        // Return the gateway data from the response
        //console.log(gatewayApiResponse);
        return gatewayApiResponse.data.data;
    } catch (error) {
        // Log and throw an error if the API request fails
        logger.error(`Error while calling the additional API for Gatewaydata to enrich beacon data ${deviceWithLowestRSSI.toUpperCase()}: ${error.message}`, error);
        throw new Error(`Error while calling the additional API for Gatewaydata to enrich beacon data ${deviceWithLowestRSSI.toUpperCase()}: ${error.message}`);
    }
}

// Main function to get the position of beacons
exports.getPosition = async(req, res) => {
    try {
        // Fetch all the beacons from the database
        const beacons = await dbBeacon.find();
        //console.log("Beacons die gefunden wurden" , beacons)
        // Initialize an empty array to store the result
        //console.log(beacons);
        const resultBeacons = [];
        console.log(beacons);

        // Loop over each beacon
        for (const beacon of beacons) {
            const beaconMac = beacon.beaconMac.toLowerCase();
            // Clone the beacon data to a new object
            let newBeacon = JSON.parse(JSON.stringify(beacon));

            try {
                // Fetch the device data for the beacon
                const deviceData = await getDeviceData(beaconMac);
                console.log("Beacons die gefunden wurden", deviceData)

                // If device data is present
                if (deviceData) {
                    const nearestData = deviceData.nearest;
                    const beaconMac = beacon.beaconMac.toLowerCase();

                    console.log("Nearest Gateway:", nearestData, beaconMac)
                    let deviceWithLowestRSSI = "";

                    // If 'nearest' is an array and has data
                    if (Array.isArray(nearestData) && nearestData.length > 0) {
                        // Sort the 'nearest' devices based on RSSI
                        nearestData.sort((a, b) => a.rssi - b.rssi);
                        // Get the device with the lowest RSSI
                        deviceWithLowestRSSI = nearestData[0].device;

                        // Add beacon basic data to the newBeacon object
                        newBeacon.basic = {
                            beaconMac: newBeacon.beaconMac,
                            NextGateway: deviceWithLowestRSSI.split("/").shift().toUpperCase(),
                        };

                        //Important step: Debug to show BeaconMAC with founded Gateway 
                        //console.log(newBeacon.basic);

                        // If dynamic data is present, add it to the newBeacon object
                        if (deviceData && deviceData.dynamb) {
                            newBeacon.dynamb = {
                                timestamp: deviceData.dynamb.timestamp,
                                accelerationx: deviceData.dynamb.acceleration && deviceData.dynamb.acceleration[0],
                                accelerationy: deviceData.dynamb.acceleration && deviceData.dynamb.acceleration[1],
                                accelerationz: deviceData.dynamb.acceleration && deviceData.dynamb.acceleration[2],
                                batteryPercentage: deviceData.dynamb.batteryPercentage,
                                batteryVoltage: deviceData.dynamb.batteryVoltage,
                                temperature: deviceData.dynamb.temperature,
                                txCount: deviceData.dynamb.txCount,
                                uptime: deviceData.dynamb.uptime,
                            };
                        }

                        // If static data is present, add it to the newBeacon object
                        if (deviceData.statid) {
                            newBeacon.statid = {
                                URI: deviceData.statid.uri,
                                uuids: deviceData.statid.uuids,
                                name: deviceData.statid.name,
                                deviceID: deviceData.statid.deviceIds,
                            };
                        }

                        // If nearest data is present, add it to the newBeacon object
                        if (deviceData.nearest) {
                            newBeacon.nearestGatewayData = {
                                device: deviceWithLowestRSSI.split("/").shift().toUpperCase(),
                                RSSI: deviceData.nearest.rssi,
                            };
                            //console.log(deviceData.nearest)
                        }

                        // Fetch the gateway data
                        const gatewayData = await getGatewayData(deviceWithLowestRSSI);
                        // If gateway data is present, add it to the newBeacon object
                        //console.log("Associated Gatewaydata by:", gatewayData)

                        if (gatewayData) {
                            newBeacon.location = {
                                GatewayDescription: gatewayData.description,
                                Gatewaytext1: gatewayData.text1,
                                Gatewaytext2: gatewayData.text2,
                                latitude: gatewayData.latitude,
                                longitude: gatewayData.longitude,
                                sapLocation: gatewayData.sapLocation,
                                tempCondition_Low: gatewayData.tempCondition_Low,
                                tempCondition_High: gatewayData.tempCondition_High
                            };
                        }

                        // Push the enriched beacon data to the result array
                        resultBeacons.push({
                            [beaconMac]: {
                                nearestGatewayData: newBeacon.nearestGatewayData,
                                dynamb: newBeacon.dynamb,
                                statid: newBeacon.statid,
                                location: newBeacon.location,
                            },
                        });
                    }
                }
            } catch (error) {
                // Log any errors during the process
                logger.error(`Error while retrieving beacons and additional data: ${error.message}`);
            }
        }

        // Send the result beacons as the response
        res.status(200).json({
            success: true,
            data: { beacons: resultBeacons },
        });

    } catch (error) {
        // Log any errors and send an error response
        logger.error(`Error while retrieving beacons and additional data: ${error.message}`);
        res.status(500).json({
            success: false,
            error: "Error while retrieving beacons and additional data.",
        });
    }
};