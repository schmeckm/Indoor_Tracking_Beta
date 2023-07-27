const mongoose = require('mongoose');
const logger = require('../log/loginfos');

const dbConn = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(process.env.MongoDB_URI, options);
    console.log('Database is connected successfully to:', process.env.MongoDB_URI,);
    logger.info(`Database is connected successfully to: ${process.env.MongoDB_URI}`);
  } catch (error) {
    logger.error(`Error while while accessing MongoDB`, error);
    console.error(`Error while while accessing MongoDB`, error);
    process.exit(1);
  }
};

module.exports = dbConn;
