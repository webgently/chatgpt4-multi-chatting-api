import { ChathistorySchema } from '../models';

const ChatHistory = {
  create: async (props: any) => {
    const { from, to, message, date } = props;

    try {
      const newData = new ChathistorySchema({
        from,
        to,
        message,
        date
      });

      const saveData = await newData.save();

      if (!saveData) {
        throw new Error('Database Error');
      }

      return saveData;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  find: async (props: any) => {
    const { filter } = props;

    try {
      const result = await ChathistorySchema.find({ $or: filter });

      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
};

export default ChatHistory;
