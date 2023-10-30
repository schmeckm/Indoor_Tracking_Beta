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

    if (req.query.beacon) {
        matchStage.beacon = { $in: [req.query.beacon] };
    }

    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    // Validate the date inputs.
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    // Creating a combined matchStage for date filtering to avoid using it twice in the pipeline.
    matchStage['events.timestamp'] = {
        $gte: startDate,
        $lte: endDate
    };

    // Simplifying the pipeline by removing one $match stage and adding allowDiskUse for dealing with memory issues.
    const pipeline = [
        { $match: matchStage },
        { $unwind: "$events" },
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

    // Fetch temperatures based on formed query. Added allowDiskUse(true) to handle potential memory issues.
    const temperatures = await temperature.aggregate(pipeline).allowDiskUse(true);

    // 204 No Content might be more suitable for scenarios where the query is valid but results in no data.
    if (!temperatures.length) {
        return res.status(204).json({ success: false, message: "No temperatures found for the provided criteria." });
    }

    res.status(200).json({ success: true, data: temperatures });

  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};
// A utility function to convert milliseconds into days, hours, and minutes.
const millisecondsToDaysHoursMinutes = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60
  };
};

// Endpoint to calculate beacon duration in an SAP location.
exports.getBeaconDurationInSAPLocation = async (req, res) => {
  try {
    const { beacon: beaconId, startDate: start, endDate: end } = req.query;

    // Validate query parameters.
    if (!beaconId || isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      return res.status(400).json({ success: false, message: "End date must be after start date" });
    }
    
    const filter = {
      beacon: beaconId,
      "events.timestamp": { $gte: startDate, $lte: endDate }
    };

    const results = await temperature.aggregate([
      { $match: filter },
      { $unwind: "$events" },
      { $sort: { "events.timestamp": 1 } },
      {
        $group: {
          _id: {
            sapLocation: "$sapLocation",
            beacon: "$beacon"
          },
          firstTimestamp: { $first: "$events.timestamp" },
          lastTimestamp: { $last: "$events.timestamp" },
          tempConditionLow: { $first: "$tempConditionLow" },
          tempConditionHigh: { $first: "$tempConditionHigh" }
        }
      },
      {
        $project: {
          totalTimeSpent: {
            $subtract: ["$lastTimestamp", "$firstTimestamp"]
          },
          tempConditionLow: 1,
          tempConditionHigh: 1
        }
      }
    ]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "No data found for provided criteria" });
    }

    const enhancedResults = results.map(result => {
      const time = millisecondsToDaysHoursMinutes(result.totalTimeSpent);
      return {
        ...result,
        totalTimeSpentDays: time.days,
        totalTimeSpentHours: time.hours,
        totalTimeSpentMinutes: time.minutes
      };
    });

    res.status(200).json({ success: true, data: enhancedResults });

  } catch (error) {
    console.error(`Error encountered: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};



