require('dotenv').config();
import mongoose from 'mongoose';

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
      }
    } catch (err: any) {
      console.log(err);
      await ConnectDatabase(mongoUrl);
    }
};

export default ConnectDatabase;