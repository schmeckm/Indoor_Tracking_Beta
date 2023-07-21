const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://schmeckm:VyZsyVQviGAjffqG@indoortracking.abzl9.mongodb.net/IndoorTracking?retryWrites=true&w=majority'; // Setze hier deine MongoDB-URI ein

const dbConn = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Weitere Optionen können hier hinzugefügt werden, falls benötigt
    };

    await mongoose.connect(dbURI, options);
    console.log('Database is connected successfully to:', dbURI);
  } catch (error) {
    // Bessere Fehlerbehandlung - z.B. Fehler in Log-Datei protokollieren
    console.error('Error connecting to the database:', error.message);
    // Möglicherweise andere Maßnahmen ergreifen, z.B. Anwendung beenden oder Benachrichtigungen senden
    process.exit(1);
  }
};

module.exports = dbConn;

