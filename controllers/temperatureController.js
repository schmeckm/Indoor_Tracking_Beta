// Import the temperature model for database interactions.
const temperature = require('../models/temperature');

/**
 * A utility function to send standardized responses.
 * 
 * @param {Object} res - Express response object.
 * @param {Boolean} success - Indicates if the operation was successful.
 * @param {Any} data - Data to send in the response.
 * @param {String} errorMessage - Error message to send in the response.
 */
const handleResponse = (res, success, data, errorMessage) => {
  if (success) {
    res.status(200).json({ success: true, data });
  } else {
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Endpoint to add temperature data.
exports.addTemp = async (req, res) => {
  try {
    // Create a new temperature record.
    const newTemperature = await temperature.create(req.body);
    handleResponse(res, true, newTemperature, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Endpoint to retrieve temperatures between two dates.
exports.getTemperaturesBetweenDates = async (req, res) => {
  try {
    let query = {};

    // Check if beacon filter is provided in query.
    if (req.query.beacon) {
        query.beacon = req.query.beacon;
    }
    
    const startDate = new Date(req.query.startDate.replace('+0000', 'Z'));
    const endDate = new Date(req.query.endDate.replace('+0000', 'Z'));

    // Validate the date inputs.
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
       return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    // Check if date filters are provided in query.
    if (req.query.startDate && req.query.endDate) {
      query['events.timestamp'] = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
      };
    }
    console.log(query);
    // Fetch temperatures based on formed query.
    const temperatures = await temperature.find(query);
    console.log(temperatures);

    res.status(200).json({ success: true, data: temperatures });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Convert a duration from milliseconds to days, hours, and minutes.
 * 
 * @param {Number} milliseconds - Duration in milliseconds.
 * @returns {Object} - Duration broken down into days, hours, and minutes.
 */
const millisecondsToDaysHoursMinutes = (milliseconds) => {
  // Constants to represent various time durations.
  const oneMinuteInMilliseconds = 60000;
  const oneHourInMilliseconds = 3600000;
  const oneDayInMilliseconds = 86400000;

  const days = Math.floor(milliseconds / oneDayInMilliseconds);
  const hours = Math.floor((milliseconds % oneDayInMilliseconds) / oneHourInMilliseconds);
  const minutes = Math.floor((milliseconds % oneHourInMilliseconds) / oneMinuteInMilliseconds);

  return { days, hours, minutes };
};

// Endpoint to calculate beacon duration in an SAP location.
exports.getBeaconDurationInSAPLocation = async (req, res) => {
  try {
    // Extract beacon ID and date range from query.
    const beaconId = req.query.beacon;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);


    // Debugging logs.
    console.log(`BeaconID: ${beaconId}`);
    console.log(`StartDate: ${startDate}`);
    console.log(`EndDate: ${endDate}`);

    // Step 1: Create filter based on beacon and date range.
    const filterByBeaconAndTime = {
      beacon: beaconId,
      "events.timestamp": { $gte: startDate, $lte: endDate }
    };

    console.log(`Filter: ${JSON.stringify(filterByBeaconAndTime)}`);

    // Step 2: Sort events by timestamp.
    const sortEventsByTimestamp = { $sort: { "events.timestamp": 1 } };

    // Step 3: Group by beacon and SAP-Location, then get the first and last timestamps.
    const groupByBeaconAndSapLocation = {
      $group: {
        _id: {
          sapLocation: "$sapLocation",
          beacon: "$beacons"
        },
        firstTimestamp: { $first: "$events.timestamp" },
        lastTimestamp: { $last: "$events.timestamp" },
        tempConditionLow: { $first: "$tempConditionLow" },
        tempConditionHigh: { $first: "$tempConditionHigh" }
      }
    };

    // Step 4: Calculate the total time a beacon spent in a location.
    const calculateTotalTimeSpent = {
      $project: {
        totalTimeSpent: {
          $subtract: ["$lastTimestamp", "$firstTimestamp"]
        },
        tempConditionLow: 1,
        tempConditionHigh: 1
      }
    };

    // Execute the aggregation pipeline.
    const results = await temperature.aggregate([
      { $match: filterByBeaconAndTime },
      { $unwind: "$events" },
      sortEventsByTimestamp,
      groupByBeaconAndSapLocation,
      calculateTotalTimeSpent
    ]);

    console.log(`Aggregation Results: ${JSON.stringify(results)}`);

    // Break down the duration into days, hours, and minutes.
    results.forEach(result => {
      const time = millisecondsToDaysHoursMinutes(result.totalTimeSpent);
      result.totalTimeSpentDays = time.days;
      result.totalTimeSpentHours = time.hours;
      result.totalTimeSpentMinutes = time.minutes;
    });

    res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error(`Error encountered: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
