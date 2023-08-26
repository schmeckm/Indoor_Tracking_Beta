const mongoose = require('mongoose');

const temperatureSchema = new mongoose.Schema({
   beacon: [String],
   gateway: [String],
   latitude:[String],
   longitude:[String],
   sapLocation:[String],
   tempConditionLow:[String],
   tempConditionHigh: [String],
  events: [{
    timestamp: Date,
    temperature: Number
  }]
});

module.exports = mongoose.model('temperature', temperatureSchema);
