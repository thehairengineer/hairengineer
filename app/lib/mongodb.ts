import mongoose from 'mongoose';

type CachedType = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  cache: {
    [key: string]: {
      data: unknown;
      timestamp: number;
    };
  };
}

declare global {
  var mongoose: CachedType | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hair-engineer';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = (global as { mongoose?: CachedType }).mongoose as CachedType;
if (!cached) {
  cached = (global as { mongoose?: CachedType }).mongoose = {
    conn: null,
    promise: null,
    cache: {},
  };
}

async function initializeCollections(db: mongoose.Connection) {
  console.log('Initializing collections...');
  const collections = await db.db?.collections();
  if (!collections) {
    console.log('No collections found in database');
    return;
  }
  
  const collectionNames = collections.map(c => c.collectionName);
  console.log('Existing collections:', collectionNames);

  if (!collectionNames.includes('appointments')) {
    console.log('Creating appointments collection...');
    await db.createCollection('appointments');
  }

  if (!collectionNames.includes('availabledates')) {
    console.log('Creating availabledates collection...');
    await db.createCollection('availabledates');
  }
}

// Cache middleware
export const withCache = async <T>(
  key: string,
  fetchData: () => Promise<T>,
  priority: boolean = false
): Promise<T> => {
  const now = Date.now();
  const cachedData = cached.cache[key];

  // Return cached data if it's still valid and not a priority request
  if (!priority && cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${key}`);
    return cachedData.data as T;
  }

  // Fetch fresh data
  console.log(`Fetching fresh data for ${key}`);
  const data = await fetchData();
  cached.cache[key] = { data, timestamp: now };
  return data;
};

async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      console.log('Connecting to MongoDB:', MONGODB_URI);
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Limit concurrent connections
        serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
        console.log('MongoDB connected successfully');
        await initializeCollections(mongooseInstance.connection);
        return mongooseInstance;
      });
    }

    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance;
    return mongooseInstance;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 