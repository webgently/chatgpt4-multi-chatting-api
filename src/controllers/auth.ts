import { UserSchema } from '../models';

const Auth = {
  create: async (props: any) => {
    const { first_name, last_name, email, user_name, password, group, permission } = props;

    try {
      const newData = new UserSchema({
        first_name,
        last_name,
        email,
        user_name,
        password: password,
        group,
        permission,
        status: 'pending'
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
      const result = await UserSchema.findOne({ $or: filter });
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  findById: async (props: any) => {
    const { param } = props;
    try {
      const result = await UserSchema.findById(param);

      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
};

export default Auth;
