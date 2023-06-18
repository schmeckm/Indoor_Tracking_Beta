const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '.env' });
console.log(process.env.MongoDB_URI);
console.log(process.env.PORT);

mongoose.set('strictQuery', false);

const dbConn = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database is connected successfully to:', process.env.MongoDB_URI);
  } catch (error) {
    console.log('Error connecting to the database:', error.message);
  }
};

module.exports = dbConn;