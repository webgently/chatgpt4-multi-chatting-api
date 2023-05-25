require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import controllers from '../controllers';

// Admin
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await controllers.Admin.getUsers({
      filter: [{}]
    });

    return res.send({ status: true, code: 201, data: users, message: 'Successfully!' });
  } catch (err: any) {
    console.log('get users error : ', err.message);
    res.status(500).send(err.message);
  }
};

export default {
  getUsers
};
