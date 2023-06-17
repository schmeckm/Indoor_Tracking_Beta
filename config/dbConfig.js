const dotenv = require('dotenv');
const mongoose = require('mongoose');
// Setze die strictQuery-Option entsprechend der gewünschten Konfiguration
mongoose.set('strictQuery', false); // oder mongoose.set('strictQuery', true);

dotenv.config({ path: '.env' });

const dbConn = () => {
	mongoose
		.connect(
			// mongo db uri to connect our database
			process.env.MongoDB_URI,
			{
				useNewUrlParser: true,
				//useCreateIndex: true,
				////useFindAndModify: false,
				//seUnifiedTopology: true,
			}
		)
		.then(db => console.log('Database is connected successfully'))
		.catch(err => console.log(err))
		
};

module.exports = dbConn;
