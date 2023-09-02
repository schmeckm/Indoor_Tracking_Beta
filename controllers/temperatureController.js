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

exports.getTemperaturesBetweenDates = async (req, res) => {
  try {
      let matchStage = {};

      // Check if beacon filter is provided in query.
      if (req.query.beacon) {
          matchStage.beacon = { $in: [req.query.beacon] };
      }

      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      // Validate the date inputs.
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid date format." });
      }

      matchStage['events.timestamp'] = {
          $gte: startDate,
          $lte: endDate
      };

      // Aggregation pipeline
      const pipeline = [
          { $match: matchStage },
          { $unwind: "$events" },
          { $match: matchStage },
          {
              $group: {
                  _id: {
                      beacon: "$beacon",
                      year: { $year: "$events.timestamp" },
                      month: { $month: "$events.timestamp" },
                      day: { $dayOfMonth: "$events.timestamp" },
                      hour: { $hour: "$events.timestamp" }
                  },
                  temperatures: { $push: "$events.temperature" },
                  count: { $sum: 1 }
              }
          },
          {
              $project: {
                  beacon: "$_id.beacon",
                  date: {
                      year: "$_id.year",
                      month: "$_id.month",
                      day: "$_id.day",
                      hour: "$_id.hour"
                  },
                  medianTemperature: {
                      $cond: [
                          { $eq: [{ $mod: ["$count", 2] }, 0] },
                          { $avg: [
                              { $arrayElemAt: ["$temperatures", { $subtract: [{ $divide: ["$count", 2]}, 1] }] },
                              { $arrayElemAt: ["$temperatures", { $divide: ["$count", 2] }] }
                          ]},
                          { $arrayElemAt: ["$temperatures", { $floor: { $divide: ["$count", 2] } }] }
                      ]
                  }
              }
          },
          { $sort: { "date": 1 } }
      ];

      // Fetch temperatures based on formed query.
      const temperatures = await temperature.aggregate(pipeline);

      if (!temperatures.length) {
          return res.status(404).json({ success: false, message: "No temperatures found for the provided criteria." });
      }

      res.status(200).json({ success: true, data: temperatures });

  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
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
