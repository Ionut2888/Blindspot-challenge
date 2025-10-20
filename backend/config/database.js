const { MongoClient } = require('mongodb');

let db = null;
let client = null;

/**
 * Connect to MongoDB Atlas
 */
async function connectToDatabase() {
  try {
    if (db) {
      console.log('[DATABASE] Already connected to MongoDB');
      return db;
    }

    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('[DATABASE] Connecting to MongoDB Atlas...');
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    db = client.db('dooh'); // Database name
    
    console.log('[DATABASE] Successfully connected to MongoDB Atlas');
    
    return db;
  } catch (error) {
    console.error('[DATABASE] Connection error:', error.message);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('[DATABASE] Connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase
};
