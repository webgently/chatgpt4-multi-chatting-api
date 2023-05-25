import { NexusSchema } from '../models';

const Nexus = {
    create: async (props: any) => {
        try {
            const newData = new NexusSchema(props);

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
            const result = await NexusSchema.find(filter);

            return result;
        } catch (err: any) {
            throw new Error(err.message);
        }
    },
    remove: async (props: any) => {
        try {
            const result = await NexusSchema.deleteMany(props);
            if (result)
                return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

export default Nexus;
