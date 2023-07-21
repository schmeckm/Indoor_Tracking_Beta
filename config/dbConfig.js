const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '../env' });

console.log(process.env.MongoDB_URI);

const dbConn = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Weitere Optionen können hier hinzugefügt werden, falls benötigt
    };

    await mongoose.connect(process.env.MongoDB_URI, options);
    console.log('Database is connected successfully to:', process.env.MongoDB_URI);
  } catch (error) {
    // Bessere Fehlerbehandlung - z.B. Fehler in Log-Datei protokollieren
    console.error('Error connecting to the database:', error.message);
    // Möglicherweise andere Maßnahmen ergreifen, z.B. Anwendung beenden oder Benachrichtigungen senden
    process.exit(1);
  }
};

module.exports = dbConn;
