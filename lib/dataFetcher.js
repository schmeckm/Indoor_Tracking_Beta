const axios = require("axios");
const mqtt = require("mqtt");
const dotenv = require("dotenv");
const path = require("path");

// Load environment configurations
dotenv.config({ path: path.resolve(__dirname, "../mqtt.env") });

const clientID_genrisch = "clientId-" + Date.now();

const mqttBrokerUrl = process.env.mqttserver;
const mqttOptions = {
    clientId: clientID_genrisch,
    username: process.env.user,
    password: process.env.password,
};
console.log(mqttOptions);
const mqttClient = mqtt.connect(mqttBrokerUrl, mqttOptions);


mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
});

mqttClient.on("error", (err) => {
    console.error("Error connecting to MQTT broker:", err);
});

function validateEnv() {
    const requiredVars = ['mqttserver', 'user', 'password'];
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is missing.`);
        }
    }
}
/**
 * Extract beacon data from the nested response structure.
 * @param {Object} beacon - The beacon data structure from the response.
 * @returns {Object} - Returns a structured object containing extracted beacon data.
 */
function extractBeaconData(beacon) {
    const beaconKey = Object.keys(beacon)[0];
    const beaconData = beacon[beaconKey];
    const data = {
        beacon: beaconKey.toUpperCase(),
        gateway: beaconData.nearestGatewayData.device,
        latitude: beaconData.location.latitude,
        longitude: beaconData.location.longitude,
        sapLocation: beaconData.location.sapLocation,
        tempCondition_Low: beaconData.location.tempCondition_Low,
        tempCondition_High: beaconData.location.tempCondition_High
    };

    if ("dynamb" in beaconData) {
        data.temperature = beaconData.dynamb.temperature;
        data.uptime = formatUptime(beaconData.dynamb.uptime);
    }

    return data;
}

/**
 * Send extracted beacon data to MQTT broker.
 * @param {Array} extractedData - The extracted beacon data.
 * @returns {Promise} - Returns a promise which resolves when data has been sent, or rejects on error.
 */
async function sendToMqtt(extractedData) {
    return new Promise((resolve, reject) => {
        extractedData.forEach((item) => {
            const deviceTopic = `beacon/${item.gatewayMac}`;
            const beaconData = {
                beacon: item.beacon,
                gateway: item.gateway,
                latitude: item.latitude,
                longitude: item.longitude,
                storageLocation: item.sapLocation,
                tempCondition_Low: item.tempCondition_Low,
                tempCondition_High: item.tempCondition_High,
                currentDateTime: getCurrentDateTime(),
                temperature: item.temperature || 0
            };

            mqttClient.publish(deviceTopic, JSON.stringify(beaconData), (err) => {
                if (err) {
                    console.error(`Failed to publish data for ${deviceTopic}:`, err);
                    reject(err);
                }
            });
        });
        resolve(); // Wenn alle Daten gesendet wurden
    });
}

async function sendToMongoDB(extractedData) {
    for (const item of extractedData) {
        const dataToMongoDB = {
            beacon: item.beacon,
            gateway: item.gateway,
            latitude: item.latitude,
            longitude: item.longitude,
            tempConditionLow: item.tempCondition_Low,
            tempConditionHigh: item.tempCondition_High,
            sapLocation: item.sapLocation,
            events: [{
                timestamp: getCurrentDateTime(),
                temperature: item.temperature || 0,
            }]
        };

        try {
            await axios.post("http://localhost:3002/api/temperature/addTemp", dataToMongoDB);
        } catch (err) {
            console.error(`Error sending data to MongoDB for beacon ${item.beacon}:`, err);
        }
    }
}


/**
 * Main function to fetch data and send to MQTT & MongoDB.
 * @param {Object} io - Socket object for emitting data to front end or other parts of the system.
 */
async function fetchDataAndSend(io) {
    validateEnv();  // Ensure environment variables are set.
    
    try {
        const response = await axios.get("http://localhost:3002/api/position/getPosition");
        const responseData = response.data;
        if (!responseData.data || !Array.isArray(responseData.data.beacons)) {
            console.error("No beacons found in the response.");
            return;
        }

        const originalBeacons = responseData.data.beacons;
        const extractedData = originalBeacons.map(beacon => extractBeaconData(beacon));
        console.log("extractedData:" ,extractedData );

        await sendToMqtt(extractedData);
        await sendToMongoDB(extractedData, originalBeacons); // Pass original beacons here

        io.on('connection', (socket) => {
            io.emit("beaconData", extractedData);
        });

    } catch (error) {
        console.error("Error during fetching or sending data:", error);
    }
}


/**
 * Convert uptime in seconds to a human-readable format.
 * @param {number} uptimeInSeconds - Uptime duration in seconds.
 * @returns {string} - Returns the uptime in the format "x Tage, x Stunden, x Minuten, x Sekunden".
 */
function formatUptime(uptimeInSeconds) {
    const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));
    const hours = Math.floor((uptimeInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
    const seconds = uptimeInSeconds % 60;

    return `${days} Tage, ${hours} Stunden, ${minutes} Minuten, ${seconds} Sekunden`;
}

/**
 * Get the current date and time in the format "YYYY-MM-DD HH:MM:SS".
 * @returns {string} - Returns the current date and time as a string.
 */
function getCurrentDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Zeitverschiebung in Millisekunden
    const localISOTime = (new Date(now - offset)).toISOString().slice(0,-1)
    return localISOTime.replace("T", " ").substr(0, 19);
}
module.exports = { fetchDataAndSend };