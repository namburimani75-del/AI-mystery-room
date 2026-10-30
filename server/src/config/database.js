import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Clean up any legacy/obsolete indexes from older versions
    try {
      const casesCollection = conn.connection.collection('cases');
      const indexes = await casesCollection.indexes();
      const obsoleteIndexNames = [
        'publicId_1',
        'ownerSessionHash_1',
        'expiresAt_1',
        'ownerSessionHash_1_idempotencyKey_1'
      ];
      for (const idx of indexes) {
        if (obsoleteIndexNames.includes(idx.name)) {
          await casesCollection.dropIndex(idx.name);
          console.log(`🧹 Dropped legacy index: ${idx.name}`);
        }
      }
    } catch {
      // Ignore if collection doesn't exist yet
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
