const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('CRITICAL ERROR: MONGODB_URI environment variable is not defined!');
      console.error('Please configure MONGODB_URI in your .env file or Render Environment Variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'studentDB', // Dedicated student database
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
