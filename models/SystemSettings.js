// Import the mongoose library for MongoDB object modeling.
const mongoose = require('mongoose');

// Define the schema for system settings using the mongoose Schema constructor.
const SystemSettingsSchema = new mongoose.Schema({
    // Define a property 'time' of type Number.
    time: Number,

    // Define another property 'DeleteTime' of type Number.
    DeleteTime: Number,
});

// Export the model using the defined schema. This model can be used for CRUD operations on the 'SystemSettings' collection in MongoDB.
module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
