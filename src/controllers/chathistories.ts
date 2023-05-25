import { ChathistorySchema, UserSchema } from '../models';

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
  },
  remove: async (props: any) => {
    const {email } = props;
    try {
      const id = await UserSchema.findOne({ email: email });
      const result = await ChathistorySchema.deleteMany({ $or: [{ from: id?._id }, { to: id?._id }] });
      if (result)
        return true;
      else
        return false;
    } catch (error) {
      return false;
    }
  }
};

export default ChatHistory;
