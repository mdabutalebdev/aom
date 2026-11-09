import mongoose from 'mongoose';
import config from '../config';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseConn?: MongooseCache;
};

if (!globalWithMongoose.mongooseConn) {
  globalWithMongoose.mongooseConn = { conn: null, promise: null };
}

export const dbConnect = async () => {
  if (!config.database_url) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  if (globalWithMongoose.mongooseConn!.conn)
    return globalWithMongoose.mongooseConn!.conn;

  if (!globalWithMongoose.mongooseConn!.promise) {
    globalWithMongoose.mongooseConn!.promise = mongoose
      .connect(config.database_url, { bufferCommands: false })
      .then((m) => {
        // eslint-disable-next-line no-console
        console.log('🗄️  Database connected successfully');
        return m;
      });
  }

  globalWithMongoose.mongooseConn!.conn =
    await globalWithMongoose.mongooseConn!.promise;

  return globalWithMongoose.mongooseConn!.conn;
};
