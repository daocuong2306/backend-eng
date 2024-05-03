import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  BUILD_MODE: process.env.NODE_ENV || 'dev',
  SESSION_SECRET: process.env.SESSION_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  DEFAULT_REGISTER_POINT: process.env.DEFAULT_REGISTER_POINT,
  PER_MINUTE_RATE_LIMIT: process.env.PER_MINUTE_RATE_LIMIT,
  DEFAULT_ROLE: process.env.DEFAULT_ROLE,
  API_KEY: process.env.API_KEY,
  API_URL: process.env.API_URL,
};
