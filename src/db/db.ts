import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SETTINGS } from '../core/settings/settings';
dotenv.config();

const dbName = 'home_works';
const mongoURI = SETTINGS.MONGO_URL || `mongodb://0.0.0.0:27017/${dbName}`;

export async function runDb() {
  try {
    await mongoose.connect(mongoURI);
    console.log('it is ok');
  } catch (e) {
    console.log('no connection');
    await mongoose.disconnect();
  }
}
