import 'dotenv/config';

export const SETTINGS = {
  DB_NAME: process.env.DB_NAME,
  MONGO_URL: process.env.MONGO_URL,
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
};
