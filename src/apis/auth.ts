require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { LoginObject, RegisterObject } from '../interfaces/global';
import controllers from '../controllers';
import { Trim, emailValidator, isStrongPassword } from '../untils';

// Normal Auth
const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, user_name, password, permission }: RegisterObject = req.body;

    if (
      !(Trim(first_name) && Trim(last_name) && Trim(email) && Trim(user_name) && Trim(password) && Trim(permission))
    ) {
      return res.send({ status: false, code: 400, message: 'Please enter all required data.' });
    } // Check user

    if (!emailValidator(email)) {
      return res.send({ status: false, code: 400, message: 'Invalid email type!' });
    } // Check email

    if (!isStrongPassword(password).status) {
      return res.send({ status: false, code: 400, message: isStrongPassword(password).msg });
    } // Check strong password

    const oldUser = await controllers.Auth.find({
      filter: [{ user_name: Trim(user_name) }, { email: Trim(email.toLowerCase()) }]
    });

    if (oldUser) {
      if (oldUser.email === Trim(email.toLowerCase())) {
        return res.send({ status: false, code: 409, message: 'Email Already Exist.' });
      }

      if (oldUser.user_name === Trim(user_name)) {
        return res.send({ status: false, code: 409, message: 'User Name Already Exist.' });
      }
    } // Check user exists

    const encryptedPassword = await bcrypt.hash(password, 10); // Encrypt password

    await controllers.Auth.create({
      first_name,
      last_name,
      email: Trim(email.toLowerCase()),
      user_name,
      password: encryptedPassword,
      permission,
      status: 'pending'
    }); // Save user data

    return res.send({ status: true, code: 201, message: 'User created successfully, please login' });
  } catch (err: any) {
    console.log('register error : ', err.message);
    res.status(500).send(err.message);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginObject = req.body;

    if (!(Trim(email) && Trim(password))) {
      return res.send({ status: false, code: 400, message: 'Please enter all required data.' });
    }

    const user = await controllers.Auth.find({
      filter: [{ email: Trim(email.toLowerCase()) }]
    });

    if (!user) {
      return res.send({ status: false, code: 404, message: 'User not exist, please register' });
    }

    const pass = await bcrypt.compare(password, user.password);

    if (pass) {
      switch (user.status) {
        case 'pending':
          return res.send({
            status: false,
            code: 403,
            message: 'User not allow from admin, please contact with admin'
          });
          break;
        case 'block':
          return res.send({
            status: false,
            code: 403,
            message: 'User blocked from admin, please contact with admin'
          });
          break;
      }

      const token = jwt.sign(
        {
          user_id: user._id,
          first_name: Trim(user.first_name),
          last_name: Trim(user.last_name),
          email: Trim(email.toLowerCase()),
          user_name: Trim(user.user_name),
          avatar: Trim(user.avatar),
          permission: Trim(user.permission)
        },
        String(process.env.TOKEN_KEY),
        {
          expiresIn: '2h'
        }
      ); // Create token

      return res.send({ status: true, code: 200, message: 'User created successfully, please login', token: token });
    } else {
      return res.send({ status: false, code: 400, message: 'Password or Email is not correct!' });
    }
  } catch (err: any) {
    console.log('login error: ', err);
    res.status(500).send(err.message);
  }
};

export default {
  register,
  login
};
