const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '.env' });
console.log('MongoDB URI:', process.env.MongoDB_URI);

mongoose.set('strictQuery', false);

const dbConn = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database is connected successfully');
  } catch (error) {
    console.log('Error connecting to the database:', error.message);
  }
};

module.exports = dbConn;
