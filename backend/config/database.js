const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('CRITICAL WARNING: MONGODB_URI environment variable is not defined!');
    console.error('Please configure MONGODB_URI in your Render Environment Variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'studentDB',
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    console.error('The server will stay online to serve health checks, but DB operations will fail until MONGODB_URI is valid.');
    return false;
  }
};

const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    databaseName: mongoose.connection.name || 'studentDB',
  };
};

module.exports = { connectDB, getDBStatus };
