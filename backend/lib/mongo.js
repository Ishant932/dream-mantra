import mongoose from 'mongoose';

let connected = false;

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function connectMongo() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (connected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);
  const isProd = process.env.NODE_ENV === 'production';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: isProd ? 15000 : 4000,
    connectTimeoutMS: isProd ? 15000 : 4000,
    maxPoolSize: 10,
  });
  connected = true;
  console.log('MongoDB Atlas connected');
  return mongoose.connection;
}

export async function disconnectMongo() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

export function getMongoStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    configured: isMongoConfigured(),
    state: states[mongoose.connection.readyState] || 'unknown',
    ready: mongoose.connection.readyState === 1,
  };
}
