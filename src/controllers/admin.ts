import { UserSchema } from '../models';

const Admin = {
  getUsers: async (props: any) => {
    const { filter } = props;

    try {
      const result = await UserSchema.find({ $or: filter });
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
};

export default Admin;
