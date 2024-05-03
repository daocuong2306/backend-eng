import { MongoClient, ServerApiVersion } from 'mongodb';

import { env } from './env';

let youthDatabaseInstance: any = null;
const mongoClientInstance = new MongoClient(env.MONGODB_URI || '', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const CONNECT_DB = async () => {
  // connect to database
  await mongoClientInstance.connect();
  // connect to my database and save it to youthDatabaseInstance
  youthDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
  try {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    const connection = await mongoClientInstance.connect();
    return connection;
  } catch (error: any) {
    throw new Error(error);
  }
};

// get database
export const GET_DB = () => {
  return youthDatabaseInstance;
};

export const DISCONNECT_DB = async () => {
  // close database connection
  await mongoClientInstance.close();
};
