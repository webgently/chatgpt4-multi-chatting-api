require('dotenv').config();

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
// import jwt from "jsonwebtoken";
import crypto from 'crypto';

import { LoginObject, RegisterObject } from '../interfaces/global';
import controllers from '../controllers';
import { Trim, emailValidator, isStrongPassword } from '../untils';

// Normal Auth
const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, user_name, password, permission }: RegisterObject = req.body;

    if (!(Trim(first_name) && Trim(last_name) && Trim(email) && Trim(user_name) && Trim(password) && Trim(permission))) {
      return res.send({ status: false, code: 400, message: 'Please enter all required data.' });
    } // Check user

    if (!emailValidator(email)) {
      return res.send({ status: false, code: 400, message: 'Invalid email type!.' });
    } // Check email

    if (!isStrongPassword(password).status) {
      return res.send({ status: false, code: 400, message: isStrongPassword(password).msg });
    } // Check strong password

    const oldUser = await controllers.Auth.find({
      filter: [{user_name: Trim(user_name)}, {email: Trim(email.toLowerCase())}]
    });

    if (oldUser) {
      if (oldUser.email === Trim(email.toLowerCase())) {
        return res.send({ status: false, code: 409, message: 'Email Already Exist.' });
      }

      if (oldUser.user_name === Trim(user_name)) {
        return  res.send({ status: false, code: 409, message: 'User Name Already Exist.' });
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

    return res.send({ status: true, code: 201, message: 'User sign up successfully!.' });
  } catch (err: any) {
    console.log('create error : ', err.message);
    res.status(500).send(err.message);
  }
};

export default {
  register
};
