require('dotenv').config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserSchema } from '../models';

const ConnectDatabase = async (mongoUrl: string) => {
  try {
    mongoose.set('strictQuery', true);
    const connectOptions: mongoose.ConnectOptions = {
      autoCreate: true,
      keepAlive: true,
      retryReads: true
    };

    const result: any = await mongoose.connect(mongoUrl, connectOptions);
    if (result) {
      console.log('MongoDB connected');
      await MakeAdminAccount();
    }
  } catch (err: any) {
    console.log(err);
    await ConnectDatabase(mongoUrl);
  }
};

const MakeAdminAccount = async () => {
  try {
    const admin = {
      first_name: process.env.ADMIN_NAME,
      last_name: '',
      email: process.env.ADMIN_EMAIL,
      user_name: process.env.ADMIN_USER_NAME,
      avatar: '',
      password: await bcrypt.hash(String(process.env.ADMIN_PASSWORD), 10),
      group: ['chatgpt'],
      permission: 'admin',
      status: 'accept'
    };

    const result = await UserSchema.findOne({ permission: 'admin' });
    if (!result) {
      const newData = new UserSchema(admin);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error('Database Error');
      }
      return;
    }
  } catch (err: any) {
    console.log(err);
  }
};

export default ConnectDatabase;
